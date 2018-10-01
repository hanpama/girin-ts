import { TypeArg, TypeExpression, TypeExpressionKind } from "./type-expression";
import { MetadataStorage, Entry } from './metadata';
import { loadFallbackRootTypes, loadBuiltInScalar } from "./definition";


export function createMetadataStorage() {

  const storage = new MetadataStorage();
  loadBuiltInScalar(storage);
  loadFallbackRootTypes(storage);
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

export function typedef(entries: Entry<any>[], maybeStorage?: MetadataStorage) {
  const storage = maybeStorage || getGlobalMetadataStorage();

  return function defDecoratorFn(targetClass: Function): void {
    entries.forEach(entry => storage.registerEntry(targetClass, entry));
  }
}
