import { GraphQLFieldConfig, GraphQLFieldConfigMap, GraphQLInterfaceType, GraphQLTypeResolver, GraphQLOutputType } from 'graphql';

import { Definition, DefinitionConfig, MetadataStorage, DefinitionKind } from '../metadata';
import { Field } from '../reference';
import { GraphQLNamedType } from 'graphql/type/definition';


export interface InterfaceTypeConfig extends DefinitionConfig {
  resolveType?: GraphQLTypeResolver<any, any>;
  description?: string;
}

/**
 * Metadata type for InterfaceType
 */
export class InterfaceType<T extends InterfaceTypeConfig = InterfaceTypeConfig> extends Definition<T> {
  public get kind(): DefinitionKind { return 'output'; }

  public buildFieldConfig(storage: MetadataStorage, field: Field): GraphQLFieldConfig<any, any> {
    const { description, deprecationReason } = field;

    return {
      type: field.resolveType(storage) as GraphQLOutputType,
      args: field.buildArgs(storage),
      resolve: field.buildResolver(storage),
      description,
      deprecationReason,
    };
  }

  public buildFieldConfigMap(storage: MetadataStorage): GraphQLFieldConfigMap<any, any> {
    const fields = [
      ...storage.findExtendReferences(Field, this.definitionName),
      ...storage.findDirectReferences(Field, this.definitionClass),
    ];
    return (
      fields.reduce((results, field) => {
        const name = field.fieldName;

        results[name] = this.buildFieldConfig(storage, field);
        return results;
      }, {} as GraphQLFieldConfigMap<any, any>)
    );
  }

  public buildTypeInstance(storage: MetadataStorage, genericTypes: GraphQLNamedType[]): GraphQLInterfaceType {
    const name = this.typeName(genericTypes);
    const description = this.description(genericTypes);
    const fields = this.buildFieldConfigMap.bind(this, storage, this.definitionClass);

    return new GraphQLInterfaceType({ name, fields, description });
  }
}