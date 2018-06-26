import { GraphQLInputObjectType, GraphQLInputFieldConfigMap, GraphQLInputFieldConfig } from "graphql";

import { Definition, DefinitionConfig } from "../base/Definition";
import { MetadataStorage, InputFieldReferenceEntry } from "../base/MetadataStorage";
import { ASTParser } from "../sdl/ast";


export interface InputTypeConfig extends DefinitionConfig {}

/**
 * Metadata type for InputObjectType
 */
export class InputType<T extends InputTypeConfig = InputTypeConfig> extends Definition<T> {

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
}
