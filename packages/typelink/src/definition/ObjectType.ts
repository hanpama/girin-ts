import { GraphQLFieldConfig, GraphQLFieldConfigMap, GraphQLInterfaceType, GraphQLObjectType, GraphQLOutputType } from 'graphql';

import { Definition, DefinitionConfig, MetadataStorage, DefinitionKind } from '../metadata';
import { Field, Implement } from '../reference';
import { GraphQLNamedType } from 'graphql/type/definition';


export interface ObjectTypeConfig extends DefinitionConfig {
  description?: string;
}

/**
 * Metadata type for ObjectType
 */
export class ObjectType<TConfig extends ObjectTypeConfig = ObjectTypeConfig> extends Definition<TConfig> {
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

  /**
   * Build GraphQLObjectType instance from metadata.
   */
  public buildTypeInstance(storage: MetadataStorage, genericTypes: GraphQLNamedType[]): GraphQLObjectType {
    const name = this.typeName(genericTypes);
    const description = this.description(genericTypes);
    const fields = this.buildFieldConfigMap.bind(this, storage);
    const interfaces = this.findInterfaces(storage);
    const isTypeOf = this.buildIsTypeOf(storage);
    return new GraphQLObjectType({ name, fields, interfaces, description, isTypeOf });
  }

  public findInterfaces(storage: MetadataStorage): GraphQLInterfaceType[] {
    const impls = [
      ...storage.findExtendReferences(Implement, this.definitionName),
      ...storage.findDirectReferences(Implement, this.definitionClass),
    ];
    return impls.map(impl => impl.resolveType(storage) as GraphQLInterfaceType);
  }

  public buildIsTypeOf(storage: MetadataStorage) {
    return (source: any) => (source instanceof this.definitionClass);
  }
}
