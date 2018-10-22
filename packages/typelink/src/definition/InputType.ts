import { GraphQLInputFieldConfig, GraphQLInputFieldConfigMap, GraphQLInputObjectType } from 'graphql';

import { Definition, DefinitionConfig, MetadataStorage } from '../metadata';
import { InputField } from '../reference';


export interface InputTypeConfig extends DefinitionConfig {}

/**
 * Metadata type for InputObjectType
 */
export class InputType<T extends InputTypeConfig = InputTypeConfig> extends Definition<T> {
  public isOutputType() { return false; }
  public isInputType() { return true; }

  public buildInputFieldConfig(storage: MetadataStorage, field: InputField): GraphQLInputFieldConfig {
    return {
      type: field.buildType(storage, field.definitionClass),
      defaultValue: field.defaultValue,
      description: field.description,
    };
  }

  public buildInputFieldConfigMap(storage: MetadataStorage, targetClass: Function): GraphQLInputFieldConfigMap {
    const fields = [
      ...storage.findExtendReferences(InputField, this.typeName()),
      ...storage.findDirectReferences(InputField, targetClass),
    ];
    return fields.reduce((results, field) => {
      results[field.fieldName] = this.buildInputFieldConfig(storage, field);
      return results;
    }, {} as GraphQLInputFieldConfigMap);
  }

  public buildTypeInstance(storage: MetadataStorage, targetClass: Function) {
    const name = this.typeName();
    const description = this.description();
    const fields = this.buildInputFieldConfigMap.bind(this, storage, targetClass);
    return new GraphQLInputObjectType({ name, fields, description });
  }

  protected instantiationCache = new WeakMap();

  public buildInstantiator(storage: MetadataStorage, targetClass: Function) {
    const fields = [
      ...storage.findExtendReferences(InputField, this.typeName()),
      ...storage.findDirectReferences(InputField, targetClass),
    ];

    const fieldInstantiators = fields.reduce((res, field) => {
      res[field.fieldName] = field.buildInstantiator(storage, targetClass);
      return res;
    }, {} as any);

    const instantiator = (values: any) => {
      let cached = this.instantiationCache.get(values);
      if (!cached) {
        cached = new (targetClass as any)();
        Object.keys(values).forEach(fieldName => {
          cached[fieldName] = fieldInstantiators[fieldName](values[fieldName]);
        });
        this.instantiationCache.set(values, cached);
      }
      return this.instantiationCache.get(values);
    };

    Object.defineProperty(instantiator, 'name', { value: 'instantiate' + targetClass.name});
    return instantiator;
  }
}
