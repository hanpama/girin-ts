import { GraphQLArgumentConfig, GraphQLInputType } from "graphql";

import { GenericMetadataConfig, GenericMetadata } from "../base/GenericMetadata";
import { memoizedGetter as builder } from "../utilities/memoize";


export interface ArgumentMetadataConfig extends GenericMetadataConfig {
  fieldName: string;
  argumentName: string;
  defaultValue?: any;
  description?: string;
}

/**
 * Metadata type for arguments
 */
export class ArgumentMetadata<T extends ArgumentMetadataConfig = ArgumentMetadataConfig> extends GenericMetadata<T> {

  public get argumentName() {
    return this.config.argumentName;
  }
  public get fieldName() {
    return this.config.fieldName;
  }

  @builder
  public get argumentConfig(): GraphQLArgumentConfig {
    const { defaultValue, description } = this.config;
    return {
      type: this.type as GraphQLInputType,
      defaultValue,
      description,
    };
  }
}
