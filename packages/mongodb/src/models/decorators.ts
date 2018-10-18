import { Model, ModelClass } from './Model';


export function field(alias?: string) {
  return function(prototype: any, propertyKey: string) {
    const fieldName = alias || propertyKey;
    const get = function getField() {
      if (this.$source[fieldName] === undefined) {
        return this.$pull().then(() => this.$source[fieldName]);
      } else {
        return this.$source[fieldName];
      }
    };
    const set = function setField(value: any) { this.$source[fieldName] = value; };
    Object.defineProperty(prototype, propertyKey, { get, set });
  };
}

export function one(modelClass: ModelClass<any>, alias?: string) {
  return function(prototype: any, propertyKey: string) {
    const fieldName = alias || propertyKey;
    const get = function getOne() {
      const sourceValue = this.$source[fieldName];

      if (sourceValue === undefined) {
        return this.$pull().then(() => new modelClass({ _id: this.$source[fieldName] }));
      } else if (sourceValue === null) {
        return null;
      } else {
        return new modelClass({ _id: sourceValue });
      }
    };
    const set = function setOne(value: Model) {
      if (!value._id) {
        throw new Error('Cannot assign to @one field because the target model instance has no _id');
      }
      this.$source[fieldName] = value._id;
    };
    Object.defineProperty(prototype, propertyKey, { get, set });
  };
}

export function many(modelClass: ModelClass<any>, alias?: string) {
  return function(prototype: any, propertyKey: string) {
    const fieldName = alias || propertyKey;
    const get = function getOne() {
      const sourceValue = this.$source[fieldName];

      if (sourceValue === undefined) {
        return this.$pull().then(() => (
          this.$source[fieldName].map((_id: any) => new modelClass({ _id }))
        ));
      } else if (sourceValue === null) {
        return null;
      } else {
        return sourceValue.map((_id: any) => new modelClass({ _id }));
      }
    };
    const set = function setOne(values: Model[]) {

      this.$source[fieldName] = values.map(value => {
        if (!value._id) {
          throw new Error('Cannot assign to @one field because the target model instance has no _id');
        }
        return value._id;
      });
    };
    Object.defineProperty(prototype, propertyKey, { get, set });
  };
}
