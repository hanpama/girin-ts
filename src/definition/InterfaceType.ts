import { GraphQLFieldConfig, GraphQLFieldConfigMap, GraphQLInterfaceType, GraphQLTypeResolver, GraphQLOutputType } from 'graphql';

import { Definition, DefinitionConfig, DefinitionKind } from '../metadata/Definition';
import { Field } from '../reference/Field';
import { TypeResolvingContext } from '../type-expression/types';


export interface InterfaceTypeConfig extends DefinitionConfig {
  resolveType?: GraphQLTypeResolver<any, any>;
  description?: string;
}

/**
 * Metadata type for InterfaceType
 */
export class InterfaceType<T extends InterfaceTypeConfig = InterfaceTypeConfig> extends Definition<T> {
  public get kind(): DefinitionKind { return 'output'; }

  protected buildFieldConfig(context: TypeResolvingContext, field: Field): GraphQLFieldConfig<any, any> {
    const { description, deprecationReason } = field;

    return {
      type: field.resolveType(context.storage) as GraphQLOutputType,
      args: field.buildArgumentMap(context),
      resolve: field.buildResolver(context),
      description,
      deprecationReason,
    };
  }

  protected buildFieldConfigMap(context: TypeResolvingContext): GraphQLFieldConfigMap<any, any> {
    const fields = this.findReference(context, Field);
    return (
      fields.reduce((results, field) => {
        const name = field.fieldName;

        results[name] = this.buildFieldConfig(context, field);
        return results;
      }, {} as GraphQLFieldConfigMap<any, any>)
    );
  }

  public buildTypeInstance(context: TypeResolvingContext): GraphQLInterfaceType {
    const name = this.definitionName;
    const description = this.description;
    const fields = this.buildFieldConfigMap.bind(this, context);

    return new GraphQLInterfaceType({ name, fields, description });
  }
}