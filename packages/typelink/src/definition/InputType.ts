import { GraphQLInputFieldConfig, GraphQLInputFieldConfigMap, GraphQLInputObjectType, GraphQLInputType } from 'graphql';

import { Definition, DefinitionConfig, MetadataStorage, DefinitionKind } from '../metadata';
import { InputField } from '../reference';
import { GraphQLNamedType } from 'graphql/type/definition';


export interface InputTypeConfig extends DefinitionConfig {}

/**
 * Metadata type for InputObjectType
 */
export class InputType<T extends InputTypeConfig = InputTypeConfig> extends Definition<T> {
  public get kind(): DefinitionKind { return 'input'; }

  public buildInputFieldConfig(storage: MetadataStorage, field: InputField): GraphQLInputFieldConfig {
    return {
      type: field.resolveType(storage) as GraphQLInputType,
      defaultValue: field.defaultValue,
      description: field.description,
    };
  }

  public buildInputFieldConfigMap(storage: MetadataStorage): GraphQLInputFieldConfigMap {
    const fields = [
      ...storage.findExtendReferences(InputField, this.definitionName),
      ...storage.findDirectReferences(InputField, this.definitionClass),
    ];
    return fields.reduce((results, field) => {
      results[field.fieldName] = this.buildInputFieldConfig(storage, field);
      return results;
    }, {} as GraphQLInputFieldConfigMap);
  }

  public buildTypeInstance(storage: MetadataStorage, genericTypes: GraphQLNamedType[]) {
    const name = this.typeName(genericTypes);
    const description = this.description(genericTypes);
    const fields = this.buildInputFieldConfigMap.bind(this, storage);
    return new GraphQLInputObjectType({ name, fields, description });
  }

  protected instantiationCache = new WeakMap();

  public buildInstantiator(storage: MetadataStorage) {
    const fields = [
      ...storage.findExtendReferences(InputField, this.definitionName),
      ...storage.findDirectReferences(InputField, this.definitionClass),
    ];

    const fieldInstantiators = fields.reduce((res, field) => {
      res[field.fieldName] = field.buildInstantiator(storage);
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
