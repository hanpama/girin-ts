import { GraphQLInputObjectType, GraphQLInputFieldConfigMap, GraphQLInputFieldConfig } from 'graphql';
import { MetadataStorage, InputFieldReferenceEntry, InputFieldMixinEntry } from '../metadata';
import { Definition, DefinitionConfig } from '../definition/Definition';


export interface InputTypeConfig extends DefinitionConfig {}

/**
 * Metadata type for InputObjectType
 */
export class InputType<T extends InputTypeConfig = InputTypeConfig> extends Definition<T> {
  public isOutputType() { return false; }
  public isInputType() { return true; }

  public buildInputFieldConfig(storage: MetadataStorage, entry: InputFieldReferenceEntry | InputFieldMixinEntry): GraphQLInputFieldConfig {
    return {
      type: entry.field.buildType(storage, entry.definitionClass),
      defaultValue: entry.field.defaultValue,
      description: entry.field.description,
    };
  }

  public buildInputFieldConfigMap(storage: MetadataStorage, targetClass: Function): GraphQLInputFieldConfigMap {
    const entries = [
      ...storage.findMixinEntries(InputFieldMixinEntry, this.typeName),
      ...storage.findReferenceEntries(InputFieldReferenceEntry, targetClass),
    ];
    return entries.reduce((results, entry) => {
      results[entry.field.defaultName] = this.buildInputFieldConfig(storage, entry);
      return results;
    }, {} as GraphQLInputFieldConfigMap);
  }

  public buildTypeInstance(storage: MetadataStorage, targetClass: Function) {
    const name = this.typeName;
    const fields = this.buildInputFieldConfigMap.bind(this, storage, targetClass);
    const description = this.description;
    return new GraphQLInputObjectType({ name, fields, description });
  }

  protected instantiationCache = new WeakMap();

  public buildInstantiator(storage: MetadataStorage, targetClass: Function) {
    const entries = [
      ...storage.findMixinEntries(InputFieldMixinEntry, this.typeName),
      ...storage.findReferenceEntries(InputFieldReferenceEntry, targetClass),
    ];

    const fieldInstantiators = entries.reduce((res, entry) => {
      res[entry.field.defaultName] = entry.field.buildInstantiator(storage, targetClass);
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
