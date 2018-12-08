import { GraphQLFieldConfig, GraphQLFieldConfigMap, GraphQLInterfaceType, GraphQLObjectType, GraphQLOutputType } from 'graphql';

import { Definition, DefinitionConfig, DefinitionKind } from '../metadata/Definition';
import { Field } from '../reference/Field';
import { Implement } from '../reference/Implement';
import { TypeResolvingContext } from '../type-expression/types';


export interface ObjectTypeConfig extends DefinitionConfig {
  description?: string;
}

/**
 * Metadata type for ObjectType
 */
export class ObjectType<TConfig extends ObjectTypeConfig = ObjectTypeConfig> extends Definition<TConfig> {
  public get kind(): DefinitionKind { return 'output'; }

  /**
   * Build GraphQLObjectType instance from metadata.
   */
  public buildTypeInstance(context: TypeResolvingContext): GraphQLObjectType {
    const name = this.definitionName;
    const description = this.description;
    const fields = this.buildFieldConfigMap.bind(this, context);
    const interfaces = this.findInterfaces(context);
    const isTypeOf = this.buildIsTypeOf(context);
    return new GraphQLObjectType({ name, fields, interfaces, description, isTypeOf });
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

  protected findInterfaces(context: TypeResolvingContext): GraphQLInterfaceType[] {
    const impls = this.findReference(context, Implement);
    return impls.map(impl => impl.resolveType(context.storage) as GraphQLInterfaceType);
  }

  protected buildIsTypeOf(context: TypeResolvingContext) {
    const { definitionClass } = this;
    if (definitionClass instanceof Function) {
      return (source: any) => (source instanceof definitionClass);
    } else {
      return () => true;
    }
  }
}
