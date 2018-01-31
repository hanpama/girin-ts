import { GraphQLInputFieldConfigMap, GraphQLInputObjectTypeConfig } from 'graphql';

import { MetadataStorage } from '../metadata/MetadataStorage';
import { InputObjectTypeMetadata } from '../metadata/InputObjectTypeMetadata';


export type InputObjectTypeDecoratorOptions = {
  name?: string;
  meta?: MetadataStorage;
  fields?: () => GraphQLInputFieldConfigMap;
  description?: string;
  astNode?: GraphQLInputObjectTypeConfig["astNode"];
}

export function InputObjectType(options: InputObjectTypeDecoratorOptions = {}) {
  return function(definitionClass: InputObjectTypeDecoratorOptions & Function) {
    const mergedConfig = Object.assign(options, definitionClass, { name: definitionClass.name, definitionClass });
    InputObjectTypeMetadata.create(mergedConfig);
  };
}
