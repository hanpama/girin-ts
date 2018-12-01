import { Model, ModelClass } from './Model';
import { HasOne, HasMany } from './association';
import { Embed, EmbedClass } from './Embed';
import { MaybeThunk, resolveMaybeThunk } from '../utils';


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
export function hasOneField(modelClass: MaybeThunk<ModelClass<any>>, alias?: string) {
  return function(prototype: any, propertyKey: string) {
    if (modelClass === undefined) {
      throw new TypeMongoPropertyDecoratorError(
        prototype,
        propertyKey,
        `The first argument given to @${hasOneField.name} decorator should be a class but undefined.`
      );
    }

    const fieldName = alias || propertyKey;
    const get = function(this: Model) {
      return new HasOne(resolveMaybeThunk(modelClass), this, fieldName);
    };
    Object.defineProperty(prototype, propertyKey, { get });
  };
}

/**
 * field containing a list of other model's _ids
 * @param modelClass
 * @param alias
 */
export function hasManyField(modelClass: MaybeThunk<ModelClass<any>>, alias?: string) {
  return function(prototype: any, propertyKey: string) {
    if (modelClass === undefined) {
      throw new TypeMongoPropertyDecoratorError(
        prototype,
        propertyKey,
        `The first argument given to @${hasManyField.name} decorator should not be undefined.`
      );
    }

    const fieldName = alias || propertyKey;
    const get = function(this: Model) {
      return new HasMany(resolveMaybeThunk(modelClass), this, fieldName);
    };
    Object.defineProperty(prototype, propertyKey, { get });
  };
}

/**
 * field containing other model's $source
 * @param embedClassOrThunk
 * @param alias
 */
export function embedOneField(embedClassOrThunk: MaybeThunk<EmbedClass<any>>, alias?: string) {
  return function(prototype: any, propertyKey: string) {

    if (embedClassOrThunk === undefined) {
      throw new TypeMongoPropertyDecoratorError(
        prototype,
        propertyKey,
        `The first argument given to @${embedOneField.name} decorator should not be undefined.`
      );
    }

    const fieldName = alias || propertyKey;
    const get = function(this: Model) {
      const embedClass = resolveMaybeThunk(embedClassOrThunk);
      return this.$source[fieldName] && new embedClass(this.$source[fieldName]);
    };
    const set = function(this: Model, value: Embed) {
      this.$source[fieldName] = value.$source;
    };
    Object.defineProperty(prototype, propertyKey, { get, set });
  };
}

/**
 * field containing a list of other model's $source
 * @param embedClassOrThunk
 * @param alias
 */
export function embedManyField(embedClassOrThunk: MaybeThunk<EmbedClass<any>>, alias?: string) {
  return function(prototype: any, propertyKey: string) {

    if (embedClassOrThunk === undefined) {
      throw new TypeMongoPropertyDecoratorError(
        prototype,
        propertyKey,
        `The first argument given to @${embedManyField.name} decorator should not be undefined.`
      );
    }

    const fieldName = alias || propertyKey;
    const get = function(this: Model) {
      const embedClass = resolveMaybeThunk(embedClassOrThunk);
      return this.$source[fieldName] && this.$source[fieldName].map((value: any) => new embedClass(value));
    };
    const set = function(this: Model, values: Embed[]) {
      this.$source[fieldName] = values.map(value => value.$source);
    };
    Object.defineProperty(prototype, propertyKey, { get, set });
  };
}


export class TypeMongoPropertyDecoratorError extends Error {
  constructor(prototype: Object, propertyKey: string, message?: string) {
    const fullMessage = `TypeMongoPropertyDecoratorError: ${prototype.constructor.toString()}.prototype.${propertyKey}`;
      + (message ? ': ' + message : '');
    super(fullMessage);
  }
}
