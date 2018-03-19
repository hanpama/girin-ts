import { GraphQLInputObjectType, GraphQLInputFieldConfigMap } from "graphql";
import { InputFieldMetadata } from "./InputFieldMetadata";
import { DefinitionMetadata, DefinitionMetadataConfig } from "../base/DefinitionMetadata";
import { memoizedGetter as builder } from "../utilities/memoize";
import { DefinitionClass, Instantiator } from "../types";


export interface InputObjectTypeMetadataConfig extends DefinitionMetadataConfig {
  definitionClass: DefinitionClass;
  description?: string;
}

export class InputObjectTypeMetadata extends DefinitionMetadata<InputObjectTypeMetadataConfig> {


  protected findInputFieldMetadata(): InputFieldMetadata[] {
    return this.storage.filter(InputFieldMetadata, this.definitionClass);
  }

  @builder
  public get typeInstance() {
    const name = this.typeName;
    const fields = () => this.fields;
    const description = this.description;
    return new GraphQLInputObjectType({ name, fields, description });
  }

  protected get fields(): GraphQLInputFieldConfigMap {
    const inputFieldMetadata = this.findInputFieldMetadata();
    return inputFieldMetadata.reduce((results, metadata) => {
      results[metadata.fieldName] = metadata.inputFieldConfig;
      return results;
    }, {} as GraphQLInputFieldConfigMap);
  }

  public get instantiate(): Instantiator {
    const { definitionClass } = this;
    const inputFieldMetadata = this.findInputFieldMetadata();

    if (definitionClass.instantiate) {
      return definitionClass.instantiate.bind(definitionClass);
    }
    return function (argsObject: any, context: any, info: any) {
      const instance = Object.create(definitionClass.prototype);
      return inputFieldMetadata.reduce((results, metadata) => {
        results[metadata.fieldName] = metadata.instantiate(argsObject[metadata.fieldName]);
        return results;
      }, instance);
    }
  }
}
