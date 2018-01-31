import { GraphQLInputFieldConfigMap, GraphQLInputObjectTypeConfig } from 'graphql';

import { MetadataStorage } from '../metadata/MetadataStorage';
import { InputObjectTypeMetadata, InputObjectTypeMetadataConfig } from '../metadata/InputObjectTypeMetadata';


export type InputObjectTypeDecoratorOptions = {
  name?: string;
  meta?: MetadataStorage;
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
      meta: options.meta || definitionClass.meta,
      definitionClass,
    }
    InputObjectTypeMetadata.create(mergedConfig);
  };
}
