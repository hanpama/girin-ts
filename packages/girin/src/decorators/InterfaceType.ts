import { GraphQLFieldConfigMap, GraphQLInterfaceTypeConfig } from 'graphql';

import { InterfaceTypeMetadata, InterfaceTypeMetadataConfig } from '../metadata/InterfaceTypeMetadata';
import { globalMetadataStorage } from "../metadata/globalMetadataStorage";


export interface InterfaceDecoratorOptions {
  name?: string;
  fields?: () => GraphQLFieldConfigMap<any, any>;

  description?: GraphQLInterfaceTypeConfig<any, any>["description"];
  astNode?: GraphQLInterfaceTypeConfig<any, any>["astNode"];
  resolveType?: GraphQLInterfaceTypeConfig<any, any>["resolveType"];
}

export function InterfaceType(options: InterfaceDecoratorOptions = {}) {
  return function(definitionClass: InterfaceDecoratorOptions & Function) {
    const mergedConfig: InterfaceTypeMetadataConfig = {
      astNode: options.astNode || definitionClass.astNode,
      description: options.description || definitionClass.description,
      fields: options.fields || definitionClass.fields,
      name: options.name || definitionClass.name,
      resolveType: options.resolveType || definitionClass.resolveType,
      definitionClass,
      meta: globalMetadataStorage,
    };
    InterfaceTypeMetadata.create(mergedConfig);
  };
}
