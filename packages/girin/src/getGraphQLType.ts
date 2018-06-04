import { MetadataStorage } from "./base/MetadataStorage";
import { TypeArg, TypeExpression } from "./type-expression/TypeExpression";


/**
 * Get a GraphQLType instance from the given storage or default
 * global metadata storage.
 * @param targetClass
 * @param options
 */
export function getGraphQLType(typeArg: TypeArg, storage?: MetadataStorage): any {
  storage = storage || require('./globalMetadataStorage').globalMetadataStorage;
  const typeExpression = new TypeExpression(typeArg);
  return typeExpression.buildTypeInstance(storage!);
}
