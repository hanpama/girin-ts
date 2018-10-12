import { TypeArg, TypeExpression, TypeExpressionKind } from "./type-expression";
import { MetadataStorage, Entry } from './metadata';
import { loadFallbackRootTypes, loadBuiltInScalar } from "./definition";


/**
 * Create a new MetadataStorage initialized with default metadata
 */
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
export function getType(typeArg: TypeArg, as: TypeExpressionKind = 'any', maybeStorage?: MetadataStorage): any {
  const storage = maybeStorage || getGlobalMetadataStorage();
  const typeExpression = new TypeExpression(typeArg, as);
  return typeExpression.getTypeInstance(storage!);
}

/**
 * Define a type linked to decorated class and add it to the given
 * storage or default global metadata storage.
 * @param metadata
 * @param maybeStorage
 */
export function defineType(metadata: Entry<any>[], maybeStorage?: MetadataStorage) {
  const storage = maybeStorage || getGlobalMetadataStorage();
  return function defDecoratorFn(targetClass: Function): void {
    metadata.forEach(entry => storage.registerEntry(targetClass, entry));
  }
}
