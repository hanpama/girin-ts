import { InterfaceTypeMetadata } from '../metadata/InterfaceTypeMetadata';
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

export function InterfaceType(config: InterfaceDecoratorOptions = {}) {
  return function(definitionClass: InterfaceDecoratorOptions & Function) {
    const mergedConfig = Object.assign(config, definitionClass, { name: definitionClass.name, definitionClass });
    InterfaceTypeMetadata.create(mergedConfig);
  };
}
