import NeDB from 'nedb';

import { FrameworkDatastore } from '../core/FrameworkDatastore';


export class NeDBFrameworkDatastore extends FrameworkDatastore {
  storage: Map<Function, NeDB> = new Map();

  constructor() {
    super();
  }

  save<T>(obj: T): Promise<T> {
    const collection = this.getCollection(obj.constructor);

    return new Promise<T>((resolve, reject) => {
      collection.insert(
        (obj as any).$source,
        (err, doc) => {
          if (err) { reject(err); }
          (obj as any).$source = doc;
          resolve(obj);
        }
      );
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
