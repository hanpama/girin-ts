import { loadFallbackRootTypes } from './definition/rootTypes';
import { loadBuiltInScalar } from './definition/scalar';
import { DefinitionKind } from './metadata/Definition';
import { MetadataStorage } from './metadata/MetadataStorage';
import { DefinitionParser } from './sdl/ast';
import { coerceType } from './type-expression/coerceType';
import { TypeExpression } from './type-expression/TypeExpression';
import { Thunk } from './types';
import { TypeArg } from './type-expression/types';


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
export function getType(typeArg: TypeExpression | TypeArg, kind: DefinitionKind = 'any'): any {
  const storage = getGlobalMetadataStorage();
  return coerceType(typeArg).getType({ kind, storage });
}

/**
 * Define a type linked to decorated class and add it to the given
 * storage or default global metadata storage.
 * @param metadataOrThunk
 */
export function defineType(parsersOrThunk: DefinitionParser[] | Thunk<DefinitionParser[]>) {
  const storage = getGlobalMetadataStorage();
  return function defDecoratorFn<T extends Function>(definitionClass: T) {
    if (Array.isArray(parsersOrThunk)) {
      parsersOrThunk.forEach(parser => {
        storage.registerMetadata(parser.parse(definitionClass));
      });
    } else {
      storage.deferRegister(() => {
        parsersOrThunk().forEach(parser => {
          storage.registerMetadata(parser.parse(definitionClass));
        });
      });
    }
    return definitionClass;
  };
}
