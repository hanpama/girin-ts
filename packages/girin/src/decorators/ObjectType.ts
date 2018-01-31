import { ObjectTypeMetadata } from '../metadata/ObjectTypeMetadata';
import { MetadataStorage } from '../metadata/MetadataStorage';
import { GraphQLObjectTypeConfig, GraphQLFieldConfigMap } from 'graphql';


export interface ObjectTypeDecoratorOptions {
  name?: string;
  meta?: MetadataStorage;
  fields?: () => GraphQLFieldConfigMap<any, any>;

  interfaces?: GraphQLObjectTypeConfig<any, any>["interfaces"];
  isTypeOf?: GraphQLObjectTypeConfig<any, any>["isTypeOf"];
  description?: GraphQLObjectTypeConfig<any, any>["description"];
  astNode?: GraphQLObjectTypeConfig<any, any>["astNode"];
  extensionASTNodes?: GraphQLObjectTypeConfig<any, any>["extensionASTNodes"];
}

export function ObjectType(options: ObjectTypeDecoratorOptions = {}) {
  return function(definitionClass: ObjectTypeDecoratorOptions & Function) {
    const mergedConfig = Object.assign(options, definitionClass, { name: definitionClass.name, definitionClass });
    ObjectTypeMetadata.create(mergedConfig);
  };
}
