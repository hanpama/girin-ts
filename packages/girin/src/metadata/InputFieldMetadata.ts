import { GraphQLInputFieldConfig, GraphQLInputType } from "graphql";
import { GenericMetadata, GenericMetadataConfig } from "../base/GenericMetadata";
import { memoizedGetter as builder } from "../utilities/memoize";


export interface InputFieldMetadataConfig extends GenericMetadataConfig {
  fieldName: string;

  defaultValue?: any;
  description?: string;

  definitionClass: Function;
}

/**
 * Metadata type for InputField
 */
export class InputFieldMetadata extends GenericMetadata<InputFieldMetadataConfig> {

  get fieldName() {
    return this.config.fieldName;
  }

  @builder
  public get inputFieldConfig(): GraphQLInputFieldConfig {
    return {
      type: this.type as GraphQLInputType, // cast
      description: this.config.description,
    };
  }
}
