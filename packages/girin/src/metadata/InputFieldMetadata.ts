import { MetadataStorage, InputMetadata } from "./MetadataStorage";
import { GraphQLInputFieldConfig } from "graphql";
import { Generic } from "./Generic";


export interface InputFieldMetadataConfig {
  definedOrder: number;
  fieldName: string;

  generic: Generic;

  defaultValue?: any;
  description?: string;

  meta?: MetadataStorage;
  definitionClass: Function;
}

export interface InputFieldMetadataBuild {
  inputFieldConfig: GraphQLInputFieldConfig;
  targetMetadata: InputMetadata;
}

export class InputFieldMetadata {
  config: InputFieldMetadataConfig;

  get meta() {
    return this.config.meta || MetadataStorage.getMetadataStorage();
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

  public static create(config: InputFieldMetadataConfig) {
    const cls = this;
    const metadata = new cls(config);
    metadata.meta.inputFieldMetadata.push(metadata);
    return metadata;
  }

  protected constructor(config: InputFieldMetadataConfig) {
    this.config = config;
  }

  protected memoizedBuild: InputFieldMetadataBuild
  public get build() {
    if (!this.memoizedBuild) {
      const { generic, description } = this.config;
      const targetMetadata = generic.getTargetMetadata();
      const type = generic.getTypeInstance();

      this.memoizedBuild = {
        targetMetadata,
        inputFieldConfig: { type, description },
      };
    }
    return this.memoizedBuild;
  }
}