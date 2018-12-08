import { GraphQLInputFieldConfig, GraphQLInputFieldConfigMap, GraphQLInputObjectType, GraphQLInputType } from 'graphql';

import { Definition, DefinitionConfig, DefinitionKind } from '../metadata/Definition';
import { InputField } from '../reference/InputField';
import { TypeResolvingContext } from '../type-expression/types';
import { defaultInputFieldInstantiator } from '../types';


export interface InputTypeConfig extends DefinitionConfig {}

/**
 * Metadata type for InputObjectType
 */
export class InputType<T extends InputTypeConfig = InputTypeConfig> extends Definition<T> {
  public get kind(): DefinitionKind { return 'input'; }

  public buildTypeInstance(context: TypeResolvingContext) {
    const name = this.definitionName;
    const description = this.description;
    const fields = this.buildInputFieldConfigMap.bind(this, context);
    return new GraphQLInputObjectType({ name, fields, description });
  }

  protected buildInputFieldConfigMap(context: TypeResolvingContext): GraphQLInputFieldConfigMap {
    const fields = this.findReference(context, InputField);

    return fields.reduce((results, field) => {
      results[field.fieldName] = this.buildInputFieldConfig(context, field);
      return results;
    }, {} as GraphQLInputFieldConfigMap);
  }

  protected buildInputFieldConfig(context: TypeResolvingContext, field: InputField): GraphQLInputFieldConfig {
    return {
      type: field.resolveType(context.storage) as GraphQLInputType,
      defaultValue: field.defaultValue,
      description: field.description,
    };
  }

  protected instantiationCache = new WeakMap();

  public buildInstantiator(context: TypeResolvingContext) {
    if (!this.definitionClass) {
      return defaultInputFieldInstantiator;
    }

    const fields = this.findReference(context, InputField);

    const fieldInstantiators = fields.reduce((res, field) => {
      res[field.fieldName] = field.buildInstantiator(context.storage);
      return res;
    }, {} as any);

    const instantiator = (values: any) => {
      let cached = this.instantiationCache.get(values);
      if (!cached) {
        cached = new (this.definitionClass as any)();
        Object.keys(values).forEach(fieldName => {
          cached[fieldName] = fieldInstantiators[fieldName](values[fieldName]);
        });
        this.instantiationCache.set(values, cached);
      }
      return this.instantiationCache.get(values);
    };

    Object.defineProperty(instantiator, 'name', { value: 'instantiate' + this.definitionClass.name});
    return instantiator;
  }
}
