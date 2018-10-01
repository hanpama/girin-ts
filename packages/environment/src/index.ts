export class Environment {
  protected moduleMap: Map<Function, Module<any, any>> = new Map();
  protected bootstrapPromiseMap: Map<Function, Promise<any>> = new Map();
  protected destroyPromiseMap: Map<Function, Promise<void>> = new Map();

  /**
   * Bootstraps the module instance which is instance of the given moduleClass.
   * If it is already bootstrapped, returns the memoized promise.
   * @param moduleClass module class to bootstrap
   */
  bootstrap<U>(moduleClass: { new(...args: any[]): Module<any, U> }): Promise<U> {
    let bootstrapPromise = this.bootstrapPromiseMap.get(moduleClass);
    if (!bootstrapPromise) {
      bootstrapPromise = Promise.resolve(this.get(moduleClass).bootstrap());
      this.bootstrapPromiseMap.set(moduleClass, bootstrapPromise);
    }
    return bootstrapPromise;
  }

  /**
   * Bootstraps all modules in this environment in reverse of loaded order.
   */
  async run(): Promise<Map<Function, any>> {
    const addedOrder: any = Array.from(this.moduleMap.keys()).reverse();
    const reducedResultMap: Map<Function, any> = new Map();
    for (let i = addedOrder.length - 1; i >= 0; i--) {
      reducedResultMap.set(addedOrder[i], await this.bootstrap(addedOrder[i] as any));
    }
    return reducedResultMap;
  }

  /**
   * Destroy all modules in this environment in reverse of bootstrapped order.
   */
  async destroy(): Promise<void> {
    const bootstrapOrder = Array.from(this.bootstrapPromiseMap.keys());
    for (let i = bootstrapOrder.length - 1; i >= 0; i--) {
      await this.get(bootstrapOrder[i] as any).destroy()
    }
    return;
  }

  /**
   * Load a module instance with given config values.
   * @param moduleClass module class to be instantiated
   * @param configs configs object
   */
  load<T>(moduleClass: { new(configs: T, environment: Environment): Module<T, any> }, configs: T) {
    this.moduleMap.set(moduleClass, new moduleClass(configs, this));
    return this;
  }

  /**
   * Get a module object which is an instance of given moduleClass
   * @param moduleClass
   */
  get<TModule = Module<any, any>>(moduleClass: { new(...args: any[]): TModule }): TModule {
    const mod = this.moduleMap.get(moduleClass) as any;
    if (!mod) { throw new Error(`Cannot find module in environment: ${moduleClass} should be loaded to environment`)}
    return mod;
  }
}

export abstract class Module<T, U> {
  constructor(protected configs: T, protected environment: Environment) {
    this.configure();
  }
  public abstract configure(): void | Promise<void>;
  public abstract bootstrap(): U | Promise<U>;
  public destroy(): void | Promise<void> {};
}

export const globalEnvironment = new Environment();
