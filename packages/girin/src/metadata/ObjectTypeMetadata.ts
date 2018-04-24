import { GraphQLObjectType, GraphQLFieldConfigMap, GraphQLInterfaceType } from "graphql";
import { DefinitionMetadata, DefinitionMetadataConfig } from "../base/DefinitionMetadata";
import { FieldMetadata } from "./FieldMetadata";
import { memoizedGetter as builder } from "../utilities/memoize";
import { Instantiator } from "../types";
import { TypeExpression } from "../type-expression/TypeExpression";


export interface ObjectTypeMetadataConfig extends DefinitionMetadataConfig {
  description?: string;
  interfaces?: TypeExpression[];
}

/**
 * Metadata type for ObjectType
 */
export class ObjectTypeMetadata<TConfig extends ObjectTypeMetadataConfig = ObjectTypeMetadataConfig> extends DefinitionMetadata<TConfig> {

  protected getFieldMetadata(): FieldMetadata[] {
    return this.storage.findGenericMetadata(FieldMetadata, this.definitionClass);
  }

  public fields(): GraphQLFieldConfigMap<any, any> {
    const fieldMetadata = this.getFieldMetadata();
    return (
      fieldMetadata.reduce((results, metadata) => {
        results[metadata.fieldName] = metadata.fieldConfig;
        return results;
      }, {} as GraphQLFieldConfigMap<any, any>)
    );
  }

  /**
   * Build GraphQLObjectType instance from metadata.
   */
  @builder
  public get typeInstance(): GraphQLObjectType {
    const name = this.typeName;
    const fields = () => this.fields();
    const isTypeOf = this.isTypeOf.bind(this);
    const interfaces = this.interfaces;
    const description = this.description;

    return new GraphQLObjectType({ name, fields, isTypeOf, interfaces, description });
  }

  /**
   * Default source type validator
   * @param source
   */
  public isTypeOf(source: any) {
    return source instanceof this.definitionClass;
  }

  public get interfaces(): GraphQLInterfaceType[] | undefined {
    const { interfaces } = this.config;
    const { storage } = this;
    return interfaces && interfaces.map(i => (
      i.buildTypeInstance(storage) as GraphQLInterfaceType)
    );
  }

  /**
   * Get the instantiator function from definition class or return default
   */
  public get instantiate(): Instantiator {
    const { definitionClass } = this;

    if (definitionClass.instantiate) {
      return definitionClass.instantiate.bind(definitionClass);
    }
    return function (sourceObject, context, info) {
      const instance = Object.create(definitionClass.prototype);
      return Object.assign(instance, sourceObject);
    }
  }
}
