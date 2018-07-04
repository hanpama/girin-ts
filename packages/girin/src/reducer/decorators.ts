/**
 * Decorator for fields resolved from source directly
 * @param fieldName
 */
export function source(fieldName?: string) {
  return function(prototype: { $source: any }, propertyKey: string) {
    const get = function() {
      return this.$source[fieldName || propertyKey];
    }
    Object.defineProperty(prototype, propertyKey, { get });
  }
}

/**
 * Decorator for field resolved after async fetching
 * prototype should have `$fetch()` method which returns a Promise
 * @param fieldName
 */
export function async(fieldName?: string) {
  return function(prototype: { $fetch: () => Promise<any> }, propertyKey: string) {
    const get = function(this: any) {
      if(!this.$__fetcher__) {
        this.$__fetcher__ = this.$fetch();
      }
      return this.$__fetcher__.then((remoteSource: any) => remoteSource[fieldName || propertyKey]);
    }
    Object.defineProperty(prototype, propertyKey, { get });
  };
}
