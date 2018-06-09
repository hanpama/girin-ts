import { GraphQLObjectType, GraphQLFieldConfigMap, GraphQLInterfaceType, GraphQLFieldConfig } from "graphql";

import { DefinitionMetadata, DefinitionMetadataConfig } from "../base/DefinitionMetadata";
import { MetadataStorage, FieldReferenceEntry } from "../base/MetadataStorage";
import { TypeExpression } from "../type-expression/TypeExpression";
import { DefinitionClass } from "../types";
import { ASTParser } from "../sdl/ast";


export interface ObjectTypeMetadataConfig extends DefinitionMetadataConfig {
  description?: string;
  interfaces?: TypeExpression[];
}

/**
 * Metadata type for ObjectType
 */
export class ObjectType<TConfig extends ObjectTypeMetadataConfig = ObjectTypeMetadataConfig> extends DefinitionMetadata<TConfig> {

  static decorate(astParser: ASTParser, storage: MetadataStorage, definitionClass: DefinitionClass) {
    astParser.objectTypeMetadataConfigs.forEach(config => {
      storage.register(new this(config), definitionClass);
    });
    astParser.fieldMetadataConfigs.forEach(config => {
      storage.registerFieldReference(config, definitionClass);
    });
  }

  public buildFieldConfig(storage: MetadataStorage, definitionClass: DefinitionClass, entry: FieldReferenceEntry): GraphQLFieldConfig<any, any> {
    const { name } = entry.reference;
    const config = Object.assign({}, entry.reference.field.buildConfig(storage), entry.reference.props);
    if ((definitionClass as any)[name] instanceof Function) {
      config.resolve = (definitionClass as any)[name];
    }
    return config;
  }

  public buildFieldConfigMap(storage: MetadataStorage, definitionClass: DefinitionClass): GraphQLFieldConfigMap<any, any> {
    const refs = storage.queryFieldReferences(definitionClass);
    return (
      refs.reduce((results, entry) => {
        results[entry.reference.name] = this.buildFieldConfig(storage, definitionClass, entry);
        return results;
      }, {} as GraphQLFieldConfigMap<any, any>)
    );
  }

  /**
   * Build GraphQLObjectType instance from metadata.
   */
  public buildTypeInstance(storage: MetadataStorage, definitionClass: DefinitionClass): GraphQLObjectType {
    const name = this.typeName;
    const fields = this.buildFieldConfigMap.bind(this, storage, definitionClass);
    const interfaces = this.findInterfaces(storage);
    const description = this.description;
    const isTypeOf = this.buildIsTypeOf(storage, definitionClass);
    return new GraphQLObjectType({ name, fields, interfaces, description, isTypeOf });
  }


  public findInterfaces(storage: MetadataStorage): GraphQLInterfaceType[] | undefined {
    const { interfaces } = this.config;
    // const { storage } = this;
    return interfaces && interfaces.map(i => (
      i.buildTypeInstance(storage) as GraphQLInterfaceType)
    );
  }

  public buildIsTypeOf(storage: MetadataStorage, definitionClass: DefinitionClass) {
    return (source: any) => (source instanceof definitionClass);
  }
}
