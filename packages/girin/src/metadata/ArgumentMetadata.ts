import { GraphQLArgumentConfig } from "graphql";
import { MetadataStorage, InputMetadata } from "./MetadataStorage";
import { Generic } from "./Generic";


export interface ArgumentMetadataConfig {
  definitionClass: Function;
  fieldName: string;
  definedOrder: number;
  name: string;

  generic: Generic;

  defaultValue?: any;
  description?: string;

  meta?: MetadataStorage;
}

export interface ArgumentMetadataBuild {
  argumentConfig: GraphQLArgumentConfig,
  targetMetadata: InputMetadata,
}

export class ArgumentMetadata {
  public static create(config: ArgumentMetadataConfig) {
    const cls = this;
    const metadata = new cls(config);
    metadata.meta.argumentMetadata.push(metadata);
    return metadata;
  }

  get meta() {
    return this.config.meta || MetadataStorage.getMetadataStorage();
  }
  get name() {
    return this.config.name;
  }
  get fieldName() {
    return this.config.fieldName;
  }
  get definitionClass() {
    return this.config.definitionClass;
  }
  get definedOrder() {
    return this.config.definedOrder;
  }

  protected constructor(public config: ArgumentMetadataConfig) {}

  protected memoizedBuild: ArgumentMetadataBuild;
  public get build() {
    if (!this.memoizedBuild) {
      this.memoizedBuild = {
        argumentConfig: this.buildArgumentConfig(),
        targetMetadata: this.config.generic.getTargetMetadata(),
      };
    }
    return this.memoizedBuild;
  }

  public buildArgumentConfig(): GraphQLArgumentConfig {
    const { generic, defaultValue, description } = this.config;
    const type = generic.getTypeInstance();
    return { type, defaultValue, description };
  }
}
