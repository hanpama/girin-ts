import { GraphQLFieldConfigMap, GraphQLTypeResolver, GraphQLInterfaceType } from "graphql";

import { DefinitionMetadata, DefinitionMetadataConfig } from "../base/DefinitionMetadata";
import { FieldMetadata } from "./FieldMetadata";
import { memoizedGetter as builder } from "../utilities/memoize";
import { defaultInstantiator, Instantiator } from "../types";


export interface InterfaceTypeMetadataConfig extends DefinitionMetadataConfig {
  resolveType?: GraphQLTypeResolver<any, any>;
  description?: string;
}

/**
 * Metadata type for InterfaceType
 */
export class InterfaceTypeMetadata extends DefinitionMetadata<InterfaceTypeMetadataConfig> {

  protected getFieldMetadata() {
    return this.storage.filter(FieldMetadata, this.definitionClass);
  }

  @builder
  public get typeInstance() {
    const name = this.typeName;
    const description = this.description;
    const fields = () => this.fields;

    return new GraphQLInterfaceType({ name, fields, description });
  }

  public get fields(): GraphQLFieldConfigMap<any, any> {
    const fieldMetadata = this.getFieldMetadata();
    return fieldMetadata.reduce((results, metadata) => {
      results[metadata.fieldName] = metadata.fieldConfig;
      return results;
    }, {} as GraphQLFieldConfigMap<any, any>);
  }

  /**
   * Get the instantiator function from definition class or return default
   */
  public get instantiate(): Instantiator {
    const { definitionClass } = this;
    return definitionClass.instantiate
      ? definitionClass.instantiate.bind(definitionClass)
      : defaultInstantiator;
  }
}