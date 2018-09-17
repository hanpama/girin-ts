import { TypeArg, TypeExpression, MetadataStorage, loadBuiltInScalar, TypeExpressionKind } from "./base";


export function createMetadataStorage() {

  const storage = new MetadataStorage();
  loadBuiltInScalar(storage);
  return storage;
}

/**
 * Global MetadataStorage used by default.
 */
export let globalMetadataStorage: MetadataStorage;

export function getGlobalMetadataStorage() {
  if (!globalMetadataStorage) {
    globalMetadataStorage = createMetadataStorage();
  }
  return globalMetadataStorage;
}

/**
 * Get a GraphQLType instance from the given storage or default
 * global metadata storage.
 * @param typeArg
 * @param storage
 */
export function getGraphQLType(typeArg: TypeArg, as: TypeExpressionKind = 'any', maybeStorage?: MetadataStorage): any {
  const storage = maybeStorage || getGlobalMetadataStorage();
  const typeExpression = new TypeExpression(typeArg, as);
  return typeExpression.getTypeInstance(storage!);
}
