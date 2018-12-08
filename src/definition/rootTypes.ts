import { MetadataStorage } from '../metadata/MetadataStorage';
import { ObjectType } from './ObjectType';
import { SubscriptionType } from './SubscriptionType';


/**
 * Fallback class for Query type.
 *
 * It can be overridden by defining custom Query class with [defineType] decorator
 */
export class Query {}

/**
 * Fallback class for Mutation type.
 *
 * It can be overridden by defining custom Mutation class with [defineType] decorator
 */
export class Mutation {}

/**
 * Fallback class for Subscription type.
 *
 * It can be overridden by defining custom Mutation class with [defineType] decorator
 */
export class Subscription {}

export function loadFallbackRootTypes(storage: MetadataStorage) {
  storage.registerMetadata([
    new ObjectType({
      definitionClass: Query,
      definitionName: 'Query'
    }),
    new ObjectType({
      definitionClass: Mutation,
      definitionName: 'Mutation'
    }),
    new SubscriptionType({
      definitionClass: Subscription,
      definitionName: 'Subscription',
    })
  ]);
}
