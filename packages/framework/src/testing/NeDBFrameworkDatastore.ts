import NeDB from 'nedb';

import { FrameworkDatastore, TypeNotSupportedError } from '../core/FrameworkDatastore';


export class NeDBFrameworkDatastore extends FrameworkDatastore {
  storage: Map<Function, NeDB> = new Map();

  constructor() {
    super();
  }

  save<T extends { id: string }>(obj: T): Promise<T> {
    const collection = this.getCollection(obj.constructor);
    if (!(obj instanceof NeDBModel)) {
      throw new TypeNotSupportedError();
    }

    return new Promise<T>((resolve, reject) => {
      if (!obj.id) {
        collection.insert(obj.$source, (err, doc) => {
          if (err) {
            reject(err);
          } else {
            obj.$source = doc;
            resolve(obj);
          }
        });
      } else {
        collection.update({ _id: obj.id }, { $set: obj.$source }, {}, (err, count) => {
          if (err) {
            reject(err);
          } else {
            resolve(obj);
          }
        });
      }
    });
  }

  find<T>(cls: { new(...args: any[]): T }, predicate: { [field: string]: any }): Promise<T | null> {
    const collection = this.getCollection(cls);
    return new Promise((resolve, reject) => collection.findOne(
      predicate,
      (err, doc) => err ? reject(err) : resolve(doc ? new cls(doc) : null)
    ));
  }

  get<T>(cls: { new(...args: any[]): T }, id: string | number): Promise<T | null> {
    const collection = this.getCollection(cls);
    return new Promise((resolve, reject) => collection.findOne(
      { _id: id },
      (err, doc) => err ? reject(err) : resolve(doc ? new cls(doc) : null)
    ));
  }

  delete(cls: Function, id: string | number): Promise<boolean> {
    const collection = this.getCollection(cls);
    return new Promise((resolve, reject) => {
      collection.remove({ _id: id }, (err, n) => err ? reject(err) : resolve(!n));
    });
  }

  protected getCollection(cls: Function): NeDB {
    let collection = this.storage.get(cls);
    if (!collection) {
      collection = new NeDB({ inMemoryOnly: true });
      this.storage.set(cls, collection);
    }
    return collection;
  }
}

export class NeDBModel {
  constructor(public $source: {_id?: any} = {}) {}

  get id() { return this.$source._id; }
  set id(value: any) { this.$source._id = value; }
}

export function field(alias?: string) {
  return function(prototype: any, propertyKey: string) {
    const fieldName = alias || propertyKey;
    const get = function getField(this: any) {
      return this.$source[fieldName];
    };
    const set = function setField(this: any, value: any) {
      this.$source[fieldName] = value;
    };
    Object.defineProperty(prototype, propertyKey, { get, set });
  };
}
