import { GraphQLInputObjectType, GraphQLInputFieldConfigMap, GraphQLInputFieldConfig } from "graphql";

import { Definition, DefinitionConfig, MetadataStorage, InputFieldReferenceEntry } from "../base";
import { ASTParser } from "../sdl/ast";


export interface InputTypeLinkedClass extends Function {
  new(): Object;
}

export interface InputTypeConfig extends DefinitionConfig {}

/**
 * Metadata type for InputObjectType
 */
export class InputType<T extends InputTypeConfig = InputTypeConfig> extends Definition<T> {
  public isOutputType() { return false; }
  public isInputType() { return true; }

  public static define(astParser?: ASTParser, storage?: MetadataStorage) {
    return super.define(astParser, storage) as (linkedClass: InputTypeLinkedClass) => void;
  };

  protected static decorate(astParser: ASTParser, storage: MetadataStorage, linkedClass: Function) {
    super.decorate(astParser, storage, linkedClass);
    astParser.inputObjectTypeMetadataConfigs.forEach(config => {
      storage.register(new this(config), linkedClass);
    });
  }

  public buildInputFieldConfig(storage: MetadataStorage, targetClass: Function, entry: InputFieldReferenceEntry): GraphQLInputFieldConfig {
    return {
      type: entry.field.buildType(storage, targetClass),
      defaultValue: entry.field.defaultValue,
      description: entry.field.description,
    };
  }

  public buildInputFieldConfigMap(storage: MetadataStorage, targetClass: Function): GraphQLInputFieldConfigMap {
    const inputFieldMetadata = storage.queryInputFieldReference(targetClass);
    return inputFieldMetadata.reduce((results, entry) => {
      results[entry.field.defaultName] = this.buildInputFieldConfig(storage, targetClass, entry);
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
    const fieldEntries = storage.queryInputFieldReference(targetClass);

    const fieldInstantiators = fieldEntries.reduce((res, entry) => {
      res[entry.field.defaultName] = entry.field.buildInstantiator(storage, targetClass);
      return res;
    }, {} as any);

    const instantiator = (values: any) => {
      let cached = this.instantiationCache.get(values);
      if (!cached) {
        cached = new (targetClass as InputTypeLinkedClass)();
        Object.keys(values).forEach(fieldName => {
          cached[fieldName] = fieldInstantiators[fieldName](values[fieldName]);
        });
        this.instantiationCache.set(values, cached);
      }
      return this.instantiationCache.get(values);
    }

    Object.defineProperty(instantiator, 'name', { value: 'instantiate' + targetClass.name});
    return instantiator;
  }
}
