import { MetadataStorage } from "./base/MetadataStorage";
import { TypeArg, TypeExpression } from "./type-expression/TypeExpression";
import { loadBuiltInScalar } from './builtins/scalar';
import { FieldMount } from "./field";


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
export function getGraphQLType(typeArg: TypeArg, maybeStorage?: MetadataStorage): any {
  const storage = maybeStorage || getGlobalMetadataStorage();
  const typeExpression = new TypeExpression(typeArg);
  return typeExpression.buildTypeInstance(storage!);
}

export function mountField(resolver: any, asName?: string, maybeStorage?: MetadataStorage) {
  const storage = maybeStorage || getGlobalMetadataStorage();
  const ref = storage!.getFieldReference(resolver);
  const field = ref.field;
  const mountName = asName || ref.mountName;
  return new FieldMount({ field, mountName, resolver });
}
