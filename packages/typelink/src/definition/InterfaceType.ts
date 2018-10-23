import { GraphQLFieldConfig, GraphQLFieldConfigMap, GraphQLInterfaceType, GraphQLTypeResolver, GraphQLOutputType } from 'graphql';

import { Definition, DefinitionConfig, MetadataStorage, GenericContext, DefinitionKind } from '../metadata';
import { Field } from '../reference';


export interface InterfaceTypeConfig extends DefinitionConfig {
  resolveType?: GraphQLTypeResolver<any, any>;
  description?: string;
}

/**
 * Metadata type for InterfaceType
 */
export class InterfaceType<T extends InterfaceTypeConfig = InterfaceTypeConfig> extends Definition<T> {
  public get kind(): DefinitionKind { return 'output'; }

  public buildFieldConfig(storage: MetadataStorage, field: Field, generic: GenericContext | null): GraphQLFieldConfig<any, any> {
    const { description, deprecationReason } = field;

    return {
      type: field.resolveType(storage) as GraphQLOutputType,
      args: field.buildArgs(storage),
      resolve: field.buildResolver(storage),
      description,
      deprecationReason,
    };
  }

  public buildFieldConfigMap(storage: MetadataStorage, generic: GenericContext | null): GraphQLFieldConfigMap<any, any> {
    const fields = [
      ...storage.findExtendReferences(Field, this.definitionName),
      ...storage.findDirectReferences(Field, this.definitionClass),
    ];
    return (
      fields.reduce((results, field) => {
        const name = field.fieldName;

        results[name] = this.buildFieldConfig(storage, field, generic);
        return results;
      }, {} as GraphQLFieldConfigMap<any, any>)
    );
  }

  public buildTypeInstance(storage: MetadataStorage, generic: GenericContext | null): GraphQLInterfaceType {
    const name = this.typeName(generic);
    const description = this.description(generic);
    const fields = this.buildFieldConfigMap.bind(this, storage, this.definitionClass);

    return new GraphQLInterfaceType({ name, fields, description });
  }
}