import { GraphQLObjectType, GraphQLFieldConfigMap, GraphQLInterfaceType, GraphQLFieldConfig } from 'graphql';

import { MetadataStorage,  FieldReferenceEntry, FieldMixinEntry, ImplementReferenceEntry, ImplementMixinEntry } from '../metadata';
import { Definition, DefinitionConfig } from '../definition/Definition';


export interface ObjectTypeConfig extends DefinitionConfig {
  description?: string;
}

/**
 * Metadata type for ObjectType
 */
export class ObjectType<TConfig extends ObjectTypeConfig = ObjectTypeConfig> extends Definition<TConfig> {
  public isOutputType() { return true; }
  public isInputType() { return false; }

  public buildFieldConfig(storage: MetadataStorage, entry: FieldReferenceEntry | FieldMixinEntry): GraphQLFieldConfig<any, any> {
    const { description, deprecationReason } = entry.field;

    return {
      type: entry.field.buildType(storage, entry.definitionClass),
      args: entry.field.buildArgs(storage, entry.definitionClass),
      resolve: entry.field.buildResolver(storage, entry.definitionClass),
      description,
      deprecationReason,
    };
  }

  public buildFieldConfigMap(storage: MetadataStorage, targetClass: Function): GraphQLFieldConfigMap<any, any> {
    const entries = [
      ...storage.findMixinEntries(FieldMixinEntry, this.typeName),
      ...storage.findReferenceEntries(FieldReferenceEntry, targetClass),
    ];
    return (
      entries.reduce((results, entry) => {
        const name = entry.field.defaultName;
        results[name] = this.buildFieldConfig(storage, entry);
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

  public findInterfaces(storage: MetadataStorage, targetClass: Function): GraphQLInterfaceType[] {
    const entries = [
      ...storage.findMixinEntries(ImplementMixinEntry, this.typeName),
      ...storage.findReferenceEntries(ImplementReferenceEntry, targetClass),
    ];
    return entries.map(entry => entry.interfaceType.getTypeInstance(storage) as GraphQLInterfaceType);
  }

  public buildIsTypeOf(storage: MetadataStorage, targetClass: Function) {
    return (source: any) => (source instanceof targetClass);
  }
}
