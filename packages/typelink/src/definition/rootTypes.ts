import { MetadataStorage } from '../metadata';
import { ObjectType } from './ObjectType';


/**
 * Fallback class for Query type.
 *
 * It can be overridden by defining custom Query class with `typedef()` decorator
 */
export class Query {}

/**
 * Fallback class for Mutation type.
 *
 * It can be overridden by defining custom Mutation class with `typedef()` decorator
 */
export class Mutation {}

export function loadFallbackRootTypes(storage: MetadataStorage) {
  storage.register(Query, () => [ new ObjectType({ definitionName: 'Query' }) ]);
  storage.register(Mutation, () => [ new ObjectType({ definitionName: 'Mutation' }) ]);
}
