import { MetadataStorage } from "./MetadataStorage";


export interface MetadataConfig {
  meta: MetadataStorage;
  definitionClass: Function;
}

export class Metadata<TConfig extends MetadataConfig = any, TBuild = any> {

  public static create<TConfig extends MetadataConfig>(config: TConfig) {
    const cls: any = this;
    let metadata = new cls(config);
    metadata.meta.register(metadata);
    return metadata;
  }

  protected config: TConfig
  public constructor(config: TConfig) {
    this.config = config;
  }

  public get meta() {
    return this.config.meta;
  }

  public get definitionClass() {
    return this.config.definitionClass;
  }

  protected memoizedBuild: TBuild;
  public get build() {
    if (!this.memoizedBuild) {
      this.memoizedBuild = this.buildMetadata();
    }
    return this.memoizedBuild;
  }

  protected buildMetadata(): TBuild {
    throw new Error('Metadata subclass should implement buildMetadata method');
  };
}