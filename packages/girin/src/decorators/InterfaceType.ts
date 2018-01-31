import { InterfaceTypeMetadata, InterfaceTypeMetadataConfig } from '../metadata/InterfaceTypeMetadata';
import { MetadataStorage } from '../metadata/MetadataStorage';
import { GraphQLFieldConfigMap, GraphQLInterfaceTypeConfig } from 'graphql';


export interface InterfaceDecoratorOptions {
  name?: string;
  meta?: MetadataStorage;
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
      meta: options.meta || definitionClass.meta,
      name: options.name || definitionClass.name,
      resolveType: options.resolveType || definitionClass.resolveType,
      definitionClass,
    };
    InterfaceTypeMetadata.create(mergedConfig);
  };
}
