import { GraphQLInputFieldConfigMap, GraphQLInputObjectTypeConfig } from 'graphql';

import { InputObjectTypeMetadata, InputObjectTypeMetadataConfig } from '../metadata/InputObjectTypeMetadata';
import { globalMetadataStorage } from "../metadata/globalMetadataStorage";


export type InputObjectTypeDecoratorOptions = {
  name?: string;
  fields?: () => GraphQLInputFieldConfigMap;
  description?: string;
  astNode?: GraphQLInputObjectTypeConfig["astNode"];
}

export function InputObjectType(options: InputObjectTypeDecoratorOptions = {}) {
  return function(definitionClass: InputObjectTypeDecoratorOptions & Function) {
    const mergedConfig: InputObjectTypeMetadataConfig = {
      name: options.name || definitionClass.name,
      astNode: options.astNode || definitionClass.astNode,
      description: options.description || definitionClass.description,
      fields: options.fields || definitionClass.fields,
      definitionClass,
      meta: globalMetadataStorage,
    }
    InputObjectTypeMetadata.create(mergedConfig);
  };
}
