export class Environment {
  private moduleMap: Map<string, Module>;
  private bootstrapPromiseMap: Map<Module, Promise<void>>;

  constructor() {
    this.moduleMap = new Map();
    this.bootstrapPromiseMap = new Map();
  }

  clean() {
    this.moduleMap = new Map();
    this.bootstrapPromiseMap = new Map();
  }

  /**
   * Bootstraps the module instance which is instance of the given label.
   * If it is already bootstrapped, returns the memoized promise.
   * @param label label of the module to bootstrap
   */
  public async getOrCreateReadyPromise(label: string): Promise<Module> {
    const mod = this.moduleMap.get(label)!;
    let bootstrapPromise = this.bootstrapPromiseMap.get(mod);
    if (!bootstrapPromise) {
      bootstrapPromise = Promise.resolve(mod.onBootstrap(this));
      this.bootstrapPromiseMap.set(mod, bootstrapPromise);
    }
    await bootstrapPromise;
    return mod;
  }

  public initialize() {
    for (let mod of this.moduleMap.values()) {
      mod.onInit();
    }
  }

  /**
   * Bootstraps all modules in this environment in reverse of loaded order.
   */
  async run(): Promise<{ [label: string]: any }> {
    this.initialize();

    const addedOrder = Array.from(this.moduleMap.keys());

    const reducedResultMap: { [label: string]: any } = {};
    try {
      for (let i = addedOrder.length - 1; i >= 0; i--) {
        reducedResultMap[addedOrder[i]] = await this.getOrCreateReadyPromise(addedOrder[i]);
      }
    } catch (e) {
      try {
        await this.destroy();
      } catch (e) {
        console.error(e);
      }
      throw e;
    }

    return reducedResultMap;
  }

  /**
   * Destroy all modules in this environment in reverse of bootstrapped order.
   */
  async destroy(): Promise<void> {
    const bootstrapOrder = Array.from(this.bootstrapPromiseMap.keys());
    for (let i = bootstrapOrder.length - 1; i >= 0; i--) {
      await bootstrapOrder[i].onDestroy(this);
    }
    this.clean();
    return;
  }

  /**
   * Load a module instance to this environment
   */
  load(mod: Module): this {
    const { label } = mod;
    this.moduleMap.set(label, mod);
    return this;
  }

  /**
   * Get a module object which is an instance of given moduleClass
   * @param moduleClass
   */
  get(label: string) {
    const mod = this.moduleMap.get(label);
    if (!mod) {
      const availableModuleLabels = Array.from(this.moduleMap.keys());
      throw new ModuleNotLoadedError(label, availableModuleLabels);
    }
    return mod;
  }
}

export class ModuleNotLoadedError extends Error {
  constructor(label: string, avaliableModuleLabels: string[]) {
    super();
    this.message = `Cannot find module in environment`
    + `: ${label} is not loaded to environment(${avaliableModuleLabels.join(', ')})`;
  }
}

export type ModuleClass<TModule extends Module> = {
  prototype: TModule;
};

export abstract class Module {
  /**
   * Unique identifier for modules in environment
   */
  public get label(): string {
    return this.constructor.name;
  }

  /**
   * Get module object from environment.
   */
  static object<TModule extends Module>(this: ModuleClass<TModule>, context = environment): TModule {
    return context.get(this.prototype.label) as TModule;
  }

  /**
   * Get promise of bootstrapping this module from environment
   */
  static bootstrap<TModule extends Module>(this: ModuleClass<TModule>, context = environment): Promise<TModule> {
    return context.getOrCreateReadyPromise(this.prototype.label) as Promise<TModule>;
  }

  /**
   * Called when module is loaded to environment
   */
  public onInit(context: Environment = environment): void { return; }

  /**
   * Called when environment is being bootstrapped
   */
  public onBootstrap(context: Environment = environment): void | Promise<void> { return; }

  /**
   * Called when environment is being destroyed
   */
  public onDestroy(context: Environment = environment): void | Promise<void> {}
}

/**
 * global environment
 */
export const environment: Environment = new Environment();
