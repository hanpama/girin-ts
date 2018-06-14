import { GraphQLInputObjectType, GraphQLInputFieldConfigMap, GraphQLInputFieldConfig } from "graphql";

import { DefinitionMetadata, DefinitionMetadataConfig } from "../base/DefinitionMetadata";
import { MetadataStorage, InputFieldReferenceEntry } from "../base/MetadataStorage";
import { DefinitionClass } from "../types";
import { ASTParser } from "../sdl/ast";


export interface InputTypeConfig extends DefinitionMetadataConfig {}

/**
 * Metadata type for InputObjectType
 */
export class InputType<T extends InputTypeConfig = InputTypeConfig> extends DefinitionMetadata<T> {

  protected static decorate(astParser: ASTParser, storage: MetadataStorage, definitionClass: DefinitionClass) {
    astParser.inputObjectTypeMetadataConfigs.forEach(config => {
      storage.register(new this(config), definitionClass);
    });
    astParser.inputFieldMetadataConfigs.forEach(config => {
      storage.registerInputFieldReference(config, definitionClass);
    });
  }

  public buildInputFieldConfig(storage: MetadataStorage, definitionClass: DefinitionClass, entry: InputFieldReferenceEntry): GraphQLInputFieldConfig {
    return Object.assign({}, entry.reference.field.buildConfig(storage), entry.reference.props);
  }

  public buildInputFieldConfigMap(storage: MetadataStorage, definitionClass: DefinitionClass): GraphQLInputFieldConfigMap {
    const inputFieldMetadata = storage.queryInputFieldReference(definitionClass);
    return inputFieldMetadata.reduce((results, entry) => {
      results[entry.reference.name] = this.buildInputFieldConfig(storage, definitionClass, entry);
      return results;
    }, {} as GraphQLInputFieldConfigMap);
  }

  public buildTypeInstance(storage: MetadataStorage, definitionClass: DefinitionClass) {
    const name = this.typeName;
    const fields = this.buildInputFieldConfigMap.bind(this, storage, definitionClass);
    const description = this.description;
    return new GraphQLInputObjectType({ name, fields, description });
  }
}
