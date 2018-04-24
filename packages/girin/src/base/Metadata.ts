import { MetadataStorage } from "./MetadataStorage";
import { DefinitionClass } from "../types";


export interface MetadataConfig<T = any> {
  directives?: T;
}

/**
 * Base class of all other metadata classes.
 * Registered to [[MetadataStorage]] and keep the reference of the storage where it's in.
 */
export abstract class Metadata<TConfig extends MetadataConfig = any> {

  public readonly definitionClass: DefinitionClass;
  protected readonly config: TConfig

  public constructor(definitionClass: Function, config: TConfig) {
    this.config = config;
    this.definitionClass = definitionClass;
  }

  public registerToStorage(storage: MetadataStorage): void {
    this.storage = storage;
    storage.register(this);
  }

  protected storage: MetadataStorage;
}
