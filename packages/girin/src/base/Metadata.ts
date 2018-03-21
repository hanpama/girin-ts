import { MetadataStorage } from "./MetadataStorage";


export interface MetadataConfig {
  definitionClass: Function;
}

/**
 * Base class of all other metadata classes.
 * Registered to [[MetadataStorage]] and keep the reference of the storage where it's in.
 */
export abstract class Metadata<TConfig extends MetadataConfig = any> {
  protected readonly config: TConfig
  public constructor(config: TConfig) {
    this.config = config;
  }

  public registerToStorage(storage: MetadataStorage): void {
    this.storage = storage;
    storage.register(this);
  }

  protected storage: MetadataStorage;

  public get definitionClass(): TConfig["definitionClass"] {
    return this.config.definitionClass;
  }
}
