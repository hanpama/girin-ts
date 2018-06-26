import { GraphQLObjectType, GraphQLFieldConfigMap, GraphQLInterfaceType, GraphQLFieldConfig } from "graphql";

import { Definition, DefinitionConfig } from "../base/Definition";
import { MetadataStorage, FieldReferenceEntry } from "../base/MetadataStorage";
import { TypeExpression } from "../type-expression/TypeExpression";
import { ASTParser } from "../sdl/ast";


export interface ObjectTypeConfig extends DefinitionConfig {
  description?: string;
  interfaces?: TypeExpression[];
}

/**
 * Metadata type for ObjectType
 */
export class ObjectType<TConfig extends ObjectTypeConfig = ObjectTypeConfig> extends Definition<TConfig> {

  protected static decorate(astParser: ASTParser | undefined, storage: MetadataStorage, linkedClass: Function) {
    super.decorate(astParser, storage, linkedClass);

    if (astParser) {
      astParser.objectTypeMetadataConfigs.forEach(config => {
        storage.register(new this(config), linkedClass);
      });
    } else {
      storage.register(new this({ typeName: linkedClass.name }), linkedClass);
    }
  }

  public buildFieldConfig(storage: MetadataStorage, targetClass: Function, entry: FieldReferenceEntry): GraphQLFieldConfig<any, any> {
    const { description, deprecationReason } = entry.field;

    return {
      type: entry.field.buildType(storage, targetClass),
      args: entry.field.buildArgs(storage, targetClass),
      resolve: entry.resolver,
      description,
      deprecationReason,
    };
  }

  public buildFieldConfigMap(storage: MetadataStorage, targetClass: Function): GraphQLFieldConfigMap<any, any> {
    const refs = storage.queryFieldReferences(targetClass);
    return (
      refs.reduce((results, entry) => {
        const name = entry.mountName;

        results[name] = this.buildFieldConfig(storage, targetClass, entry);
        return results;
      }, {} as GraphQLFieldConfigMap<any, any>)
    );
  }

  /**
   * Build GraphQLObjectType instance from metadata.
   */
  public buildTypeInstance(storage: MetadataStorage, targetClass: Function): GraphQLObjectType {
    const name = this.typeName || targetClass.constructor.name;
    const fields = this.buildFieldConfigMap.bind(this, storage, targetClass);
    const interfaces = this.findInterfaces(storage, targetClass);
    const description = this.description;
    const isTypeOf = this.buildIsTypeOf(storage, targetClass);
    return new GraphQLObjectType({ name, fields, interfaces, description, isTypeOf });
  }

  public findInterfaces(storage: MetadataStorage, targetClass: Function): GraphQLInterfaceType[] | undefined {
    const { interfaces } = this.config;
    return interfaces && interfaces.map(i => (
      i.buildTypeInstance(storage, targetClass) as GraphQLInterfaceType)
    );
  }

  public buildIsTypeOf(storage: MetadataStorage, targetClass: Function) {
    return (source: any) => (source instanceof targetClass);
  }
}
