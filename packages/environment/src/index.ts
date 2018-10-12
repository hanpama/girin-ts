export interface Environment {
  /**
   * Bootstraps the module instance which is instance of the given moduleClass.
   * If it is already bootstrapped, returns the memoized promise.
   * @param moduleClass module class to bootstrap
   */
  bootstrap(label: string): any;
  /**
   * Bootstraps all modules in this environment in reverse of loaded order.
   */
  run(): Promise<{ [label: string]: any }>;
  /**
   * Destroy all modules in this environment in reverse of bootstrapped order.
   */
  destroy(): Promise<void>;
  /**
   * Load a module instance
   */
  load(mod: EnvironmentEntry): this;
  /**
   * Get a module object which is an instance of given moduleClass
   * @param moduleClass
   */
  get(label: string): EnvironmentEntry;
}

export interface EnvironmentEntry {
  label: string;
  bootstrap: () => any;
  destroy: () => any;
}

class EnvironmentImpl implements Environment {
  private moduleMap: Map<string, EnvironmentEntry>;
  private bootstrapPromiseMap: Map<EnvironmentEntry, Promise<any>>;

  constructor() {
    this.initialize();
  }

  initialize() {
    this.moduleMap = new Map();
    this.bootstrapPromiseMap = new Map();
  }

  bootstrap(label: string) {
    const mod = this.get(label);
    let bootstrapPromise = this.bootstrapPromiseMap.get(mod);
    if (!bootstrapPromise) {
      bootstrapPromise = Promise.resolve(mod.bootstrap());
      this.bootstrapPromiseMap.set(mod, bootstrapPromise);
    }
    return bootstrapPromise;
  }

  async run(): Promise<{ [label: string]: any }> {
    const addedOrder = Array.from(this.moduleMap.keys()).reverse();
    const reducedResultMap: { [label: string]: any } = {};
    for (let i = addedOrder.length - 1; i >= 0; i--) {
      reducedResultMap[addedOrder[i]] = await this.bootstrap(addedOrder[i]);
    }
    return reducedResultMap;
  }

  async destroy(): Promise<void> {
    const bootstrapOrder = Array.from(this.bootstrapPromiseMap.keys());
    for (let i = bootstrapOrder.length - 1; i >= 0; i--) {
      await bootstrapOrder[i].destroy()
    }
    return;
  }

  load(mod: EnvironmentEntry): this {
    const { label } = mod;
    this.moduleMap.set(label, mod);
    return this;
  }

  get(label: string) {
    const mod = this.moduleMap.get(label);
    if (!mod) { throw new Error(`Cannot find module in environment: ${label} should be loaded to environment`)}
    return mod;
  }
}

export type ModuleClass<TModule extends Module<U>, U> = {
  new(...args: any[]): TModule;
}

export abstract class Module<U> implements EnvironmentEntry {
  public get label(): string {
    return this.constructor.name;
  };

  static object<TModule extends Module<any>>(this: ModuleClass<TModule, any>): TModule {
    return environment.get(this.prototype.label) as TModule;
  }
  static bootstrap<U>(this: ModuleClass<Module<U>, U>): Promise<U> {
    return environment.bootstrap(this.prototype.label);
  }

  public abstract bootstrap(): U | Promise<U>;
  public destroy(): void | Promise<void> {};
}

/**
 * global environment
 */
export const environment: Environment = new EnvironmentImpl();
