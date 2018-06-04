import { GraphQLInputObjectType, GraphQLInputFieldConfigMap, GraphQLInputFieldConfig } from "graphql";

import { DefinitionMetadata, DefinitionMetadataConfig } from "../base/DefinitionMetadata";
import { MetadataStorage, InputFieldReferenceEntry } from "../base/MetadataStorage";
import { DefinitionClass } from "../types";


export interface InputTypeMetadataConfig extends DefinitionMetadataConfig {}

/**
 * Metadata type for InputObjectType
 */
export class InputTypeMetadata<T extends InputTypeMetadataConfig = InputTypeMetadataConfig> extends DefinitionMetadata<T> {

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
