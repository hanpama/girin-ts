import { GraphQLFieldConfig, GraphQLFieldConfigMap, GraphQLInterfaceType, GraphQLTypeResolver } from 'graphql';

import { Definition, DefinitionConfig, MetadataStorage } from '../metadata';
import { Field } from '../reference';


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

  public buildFieldConfig(storage: MetadataStorage, field: Field): GraphQLFieldConfig<any, any> {
    const { description, deprecationReason } = field;

    return {
      type: field.buildType(storage, field.definitionClass),
      args: field.buildArgs(storage, field.definitionClass),
      resolve: field.buildResolver(storage, field.definitionClass),
      description,
      deprecationReason,
    };
  }

  public buildFieldConfigMap(storage: MetadataStorage, targetClass: Function): GraphQLFieldConfigMap<any, any> {
    const fields = [
      ...storage.findExtendReferences(Field, this.typeName()),
      ...storage.findDirectReferences(Field, targetClass),
    ];
    return (
      fields.reduce((results, field) => {
        const name = field.fieldName;

        results[name] = this.buildFieldConfig(storage, field);
        return results;
      }, {} as GraphQLFieldConfigMap<any, any>)
    );
  }

  public buildTypeInstance(storage: MetadataStorage, targetClass: Function): GraphQLInterfaceType {
    const name = this.typeName();
    const description = this.description();
    const fields = this.buildFieldConfigMap.bind(this, storage, targetClass);

    return new GraphQLInterfaceType({ name, fields, description });
  }
}