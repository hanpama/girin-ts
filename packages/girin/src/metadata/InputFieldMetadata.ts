import { GraphQLInputFieldConfig } from "graphql";

import { Metadata, MetadataConfig } from "./Metadata";
import { Generic } from "./Generic";
import { InputMetadata } from "./types";


export interface InputFieldMetadataConfig extends MetadataConfig {
  definedOrder: number;
  fieldName: string;

  generic: Generic;

  defaultValue?: any;
  description?: string;

  definitionClass: Function;
}

export interface InputFieldMetadataBuild {
  inputFieldConfig: GraphQLInputFieldConfig;
  targetMetadata: InputMetadata;
}

export class InputFieldMetadata extends Metadata<InputFieldMetadataConfig, InputFieldMetadataBuild> {

  get definitionClass() {
    return this.config.definitionClass;
  }
  get fieldName() {
    return this.config.fieldName;
  }
  get definedOrder() {
    return this.config.definedOrder;
  }

  protected buildMetadata() {
    const { generic, description } = this.config;
    const targetMetadata = generic.getTargetMetadata();
    const type = generic.getTypeInstance();
    return {
      targetMetadata,
      inputFieldConfig: { type, description },
    };
  }
}