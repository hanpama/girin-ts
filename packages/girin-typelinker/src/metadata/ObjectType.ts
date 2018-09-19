import { GraphQLObjectType, GraphQLFieldConfigMap, GraphQLInterfaceType, GraphQLFieldConfig } from "graphql";

import { Definition, DefinitionConfig, MetadataStorage, FieldReferenceEntry, TypeExpression, ExtensionFieldReferenceEntry } from "../base";


export interface ObjectTypeConfig extends DefinitionConfig {
  description?: string;
  // interfaces?: TypeExpression[];
}

/**
 * Metadata type for ObjectType
 */
export class ObjectType<TConfig extends ObjectTypeConfig = ObjectTypeConfig> extends Definition<TConfig> {
  public isOutputType() { return true; }
  public isInputType() { return false; }

  public buildFieldConfig(storage: MetadataStorage, targetClass: Function, entry: FieldReferenceEntry | ExtensionFieldReferenceEntry): GraphQLFieldConfig<any, any> {
    const { description, deprecationReason } = entry.field;

    return {
      type: entry.field.buildType(storage, targetClass),
      args: entry.field.buildArgs(storage, targetClass),
      resolve: entry.field.buildResolver(storage, targetClass, entry.resolver),
      description,
      deprecationReason,
    };
  }

  public buildFieldConfigMap(storage: MetadataStorage, targetClass: Function): GraphQLFieldConfigMap<any, any> {
    const refs = [
      ...storage.queryExtensionFieldReferences(this.typeName),
      ...storage.queryFieldReferences(targetClass),
    ];
    return (
      refs.reduce((results, entry) => {
        const name = entry.field.defaultName;
        results[name] = this.buildFieldConfig(storage, targetClass, entry);
        return results;
      }, {} as GraphQLFieldConfigMap<any, any>)
    );
  }

  /**
   * Build GraphQLObjectType instance from metadata.
   */
  public buildTypeInstance(storage: MetadataStorage, targetClass: Function): GraphQLObjectType {
    const name = this.typeName;
    const fields = this.buildFieldConfigMap.bind(this, storage, targetClass);
    const interfaces = this.findInterfaces(storage, targetClass);
    const description = this.description;
    const isTypeOf = this.buildIsTypeOf(storage, targetClass);
    return new GraphQLObjectType({ name, fields, interfaces, description, isTypeOf });
  }

  public findInterfaces(storage: MetadataStorage, targetClass: Function): GraphQLInterfaceType[] | undefined {
    return storage.queryImplementReferences(targetClass).map(entry => (
      entry.interfaceType.getTypeInstance(storage, targetClass) as GraphQLInterfaceType
    ))
  }

  public buildIsTypeOf(storage: MetadataStorage, targetClass: Function) {
    return (source: any) => (source instanceof targetClass);
  }
}
