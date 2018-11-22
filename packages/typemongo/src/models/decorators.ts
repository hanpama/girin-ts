import { Model, ModelClass } from './Model';
import { HasOne, HasMany } from './association';
import { Embed, EmbedClass } from './Embed';


export function field(alias?: string) {
  return function(prototype: any, propertyKey: string) {
    const fieldName = alias || propertyKey;
    const get = function getField(this: Model) {
      return this.$source[fieldName];
    };
    const set = function setField(this: Model, value: any) { this.$source[fieldName] = value; };
    Object.defineProperty(prototype, propertyKey, { get, set });
  };
}

/**
 * field containing other model's _id
 * @param modelClass
 * @param alias
 */
export function hasOne(modelClass: ModelClass<any>, alias?: string) {
  return function(prototype: any, propertyKey: string) {
    const fieldName = alias || propertyKey;
    const get = function(this: Model) {
      return new HasOne(modelClass, this, fieldName);
    };
    Object.defineProperty(prototype, propertyKey, { get });
  };
}

/**
 * field containing list of other model's _ids
 * @param modelClass
 * @param alias
 */
export function hasMany(modelClass: ModelClass<any>, alias?: string) {
  return function(prototype: any, propertyKey: string) {
    const fieldName = alias || propertyKey;
    const get = function(this: Model) {
      return new HasMany(modelClass, this, fieldName);
    };
    Object.defineProperty(prototype, propertyKey, { get });
  };
}


export function embedOne(embedClass: EmbedClass<any>, alias?: string) {
  return function(prototype: any, propertyKey: string) {
    const fieldName = alias || propertyKey;
    const get = function(this: Model) {
      return this.$source[fieldName] && new embedClass(this.$source[fieldName]);
    };
    const set = function(this: Model, value: Embed) {
      this.$source[fieldName] = value.$source;
    };
    Object.defineProperty(prototype, propertyKey, { get, set });
  };
}

export function embedMany(embedClass: EmbedClass<any>, alias?: string) {
  return function(prototype: any, propertyKey: string) {
    const fieldName = alias || propertyKey;
    const get = function(this: Model) {
      return this.$source[fieldName] && this.$source[fieldName].map((value: any) => new embedClass(value));
    };
    const set = function(this: Model, values: Embed[]) {
      this.$source[fieldName] = values.map(value => value.$source);
    };
    Object.defineProperty(prototype, propertyKey, { get, set });
  };
}
