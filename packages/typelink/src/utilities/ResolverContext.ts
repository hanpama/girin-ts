import { GraphQLResolveInfo } from 'graphql';


/**
 * Class-based resolver context
 */
export class ResolverContext<TSource = undefined, TContext = any> {
  public $env: IArguments;
  public get $source(): TSource {
    return this.$env[0];
  }
  public get $context(): TContext {
    return this.$env[1];
  }
  public get $info(): GraphQLResolveInfo {
    return this.$env[2];
  }

  constructor(_base: TSource, _context?: TContext, _info?: GraphQLResolveInfo) {
    this.$env = arguments;
  }
}

/**
 * Decorator for fields resolved from source directly
 * @param fieldName
 */
export function source(fieldName?: string) {
  return function(prototype: { $source: any }, propertyKey: string) {
    const get = function(this: any) {
      return this.$source[fieldName || propertyKey];
    };
    const set = function(this: any, value: any) {
      this.$source[fieldName || propertyKey] = value;
    };
    Object.defineProperty(prototype, propertyKey, { get, set });
  };
}

/**
 * Decorator for field resolved after async fetching
 * prototype should have `$fetch()` method which returns a Promise
 * @param fieldName
 */
export function lazy(fieldName?: string) {
  return function(prototype: { $fetch: () => Promise<any> }, propertyKey: string) {
    const get = function(this: any) {
      if (!this.$__fetcher__) {
        this.$__fetcher__ = this.$fetch();
      }
      return this.$__fetcher__.then((remoteSource: any) => remoteSource[fieldName || propertyKey]);
    };
    Object.defineProperty(prototype, propertyKey, { get });
  };
}
