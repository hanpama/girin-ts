import { GraphQLObjectType, GraphQLFieldConfigMap, GraphQLInterfaceType, GraphQLFieldConfig } from "graphql";

import { Definition, DefinitionConfig } from "../base/Definition";
import { MetadataStorage, FieldReferenceEntry } from "../base/MetadataStorage";
import { TypeExpression } from "../type-expression/TypeExpression";
import { DefinitionClass } from "../types";
import { ASTParser } from "../sdl/ast";


export interface ObjectTypeConfig extends DefinitionConfig {
  description?: string;
  interfaces?: TypeExpression[];
}

/**
 * Metadata type for ObjectType
 */
export class ObjectType<TConfig extends ObjectTypeConfig = ObjectTypeConfig> extends Definition<TConfig> {

  protected static decorate(astParser: ASTParser | undefined, storage: MetadataStorage, definitionClass: DefinitionClass) {
    if (astParser) {
      astParser.objectTypeMetadataConfigs.forEach(config => {
        storage.register(new this(config), definitionClass);
      });
      astParser.fieldMetadataConfigs.forEach(config => {
        storage.registerFieldReference(config, definitionClass);
      });
    } else {
      storage.register(new this({ typeName: definitionClass.name }), definitionClass);
    }
  }

  public buildFieldConfig(storage: MetadataStorage, definitionClass: DefinitionClass, entry: FieldReferenceEntry): GraphQLFieldConfig<any, any> {
    const { name } = entry.reference;
    const config = Object.assign({}, entry.reference.field.buildConfig(storage, definitionClass), entry.reference.props);
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
    const name = this.typeName || definitionClass.constructor.name;
    const fields = this.buildFieldConfigMap.bind(this, storage, definitionClass);
    const interfaces = this.findInterfaces(storage, definitionClass);
    const description = this.description;
    const isTypeOf = this.buildIsTypeOf(storage, definitionClass);
    return new GraphQLObjectType({ name, fields, interfaces, description, isTypeOf });
  }


  public findInterfaces(storage: MetadataStorage, definitionClass: DefinitionClass): GraphQLInterfaceType[] | undefined {
    const { interfaces } = this.config;
    return interfaces && interfaces.map(i => (
      i.buildTypeInstance(storage, definitionClass) as GraphQLInterfaceType)
    );
  }

  public buildIsTypeOf(storage: MetadataStorage, definitionClass: DefinitionClass) {
    return (source: any) => (source instanceof definitionClass);
  }
}
