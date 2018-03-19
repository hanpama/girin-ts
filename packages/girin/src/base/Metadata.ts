import { MetadataStorage } from "./MetadataStorage";


export interface MetadataConfig {
  definitionClass: Function;
  // storage: MetadataStorage;
}

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
