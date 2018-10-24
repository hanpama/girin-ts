import { GraphQLFieldConfig, GraphQLFieldConfigMap, GraphQLInterfaceType, GraphQLObjectType, GraphQLOutputType } from 'graphql';

import { Definition, DefinitionConfig, DefinitionKind } from '../metadata';
import { Field, Implement } from '../reference';
import { TypeResolvingContext } from '../type-expression';


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
    const name = this.typeName(context);
    const description = this.description(context);
    const fields = this.buildFieldConfigMap.bind(this, context);
    const interfaces = this.findInterfaces(context);
    const isTypeOf = this.buildIsTypeOf(context);
    return new GraphQLObjectType({ name, fields, interfaces, description, isTypeOf });
  }

  public buildFieldConfigMap(context: TypeResolvingContext): GraphQLFieldConfigMap<any, any> {

    const fields = [
      ...context.storage.findExtendReferences(Field, this.definitionName),
      ...context.storage.findDirectReferences(Field, this.definitionClass),
    ];
    return (
      fields.reduce((results, field) => {
        const name = field.fieldName;
        results[name] = this.buildFieldConfig(context, field);
        return results;
      }, {} as GraphQLFieldConfigMap<any, any>)
    );
  }

  public buildFieldConfig(context: TypeResolvingContext, field: Field): GraphQLFieldConfig<any, any> {
    const { description, deprecationReason } = field;

    return {
      type: field.resolveType(context) as GraphQLOutputType,
      args: field.buildArgumentMap(context),
      resolve: field.buildResolver(context),
      description,
      deprecationReason,
    };
  }

  public findInterfaces(context: TypeResolvingContext): GraphQLInterfaceType[] {
    const impls = [
      ...context.storage.findExtendReferences(Implement, this.definitionName),
      ...context.storage.findDirectReferences(Implement, this.definitionClass),
    ];
    return impls.map(impl => impl.resolveType(context) as GraphQLInterfaceType);
  }

  public buildIsTypeOf(context: TypeResolvingContext) {
    return (source: any) => (source instanceof this.definitionClass);
  }
}
