export class Entry<T> {
  // static from(value: any) {
  //   return value instanceof this ? value : new this(value);
  // }
  constructor(protected __properties?: T) {}
}

export function property() {
  return function(prototype: any, propertyKey: string) {
    const get = function() {
      return this.__properties[propertyKey];
    }
    const set = function(value: any) {
      this.__properties[propertyKey] = value;
    }
    Object.defineProperty(prototype, propertyKey, { get, set });
  }
}
