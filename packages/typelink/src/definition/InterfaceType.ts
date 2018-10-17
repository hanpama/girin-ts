import { GraphQLFieldConfigMap, GraphQLTypeResolver, GraphQLInterfaceType, GraphQLFieldConfig } from 'graphql';

import { MetadataStorage, FieldReferenceEntry, FieldMixinEntry } from '../metadata';
import { Definition, DefinitionConfig } from '../definition/Definition';


export interface InterfaceTypeConfig extends DefinitionConfig {
  resolveType?: GraphQLTypeResolver<any, any>;
  description?: string;
}

/**
 * Metadata type for InterfaceType
 */
export class InterfaceType<T extends InterfaceTypeConfig = InterfaceTypeConfig> extends Definition<T> {
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

  public buildTypeInstance(storage: MetadataStorage, targetClass: Function): GraphQLInterfaceType {
    const name = this.typeName;
    const fields = this.buildFieldConfigMap.bind(this, storage, targetClass);

    const description = this.description;
    return new GraphQLInterfaceType({ name, fields, description });
  }
}