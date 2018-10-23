import { MetadataStorage, Metadata, MetadataFn, TypeArg, TypeExpression, DefinitionKind } from './metadata';
import { loadFallbackRootTypes, loadBuiltInScalar } from './definition';


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
export function getType(typeArg: TypeArg, as: DefinitionKind = 'any'): any {
  const storage = getGlobalMetadataStorage();
  return TypeExpression.coerce(typeArg).getType(storage, as);
}

/**
 * Define a type linked to decorated class and add it to the given
 * storage or default global metadata storage.
 * @param metadataOrFn
 */
export function defineType(metadataOrFn: (Metadata[] | MetadataFn)) {
  const storage = getGlobalMetadataStorage();
  return function defDecoratorFn(targetClass: Function): void {
    const metadataFn: MetadataFn = Array.isArray(metadataOrFn) ? () => metadataOrFn : metadataOrFn;
    storage.register(targetClass, metadataFn);
  };
}
