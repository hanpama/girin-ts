import { FrameworkDatastore, TypeNotSupportedError } from '@girin/framework';
import { Model, ModelClass } from '@girin/typemongo';

import { ObjectID } from 'bson';


export class TypeMongoFrameworkDatastore extends FrameworkDatastore {

  save<T extends { id: string }>(obj: T): Promise<T> {
    if (!(obj instanceof Model)) {
      throw new TypeNotSupportedError();
    }
    return obj.$save();
  }

  find<T extends { id: string }>(type: ModelClass<any>, predicate: { [field: string]: any }): Promise<T | null> {
    if (!(type.prototype instanceof Model)) {
      throw new TypeNotSupportedError();
    }
    return type.findOne(predicate) as Promise<T | null>;
  }

  get<T extends { id: string | number }>(type: ModelClass<any>, id: string): Promise<T | null> {
    if (!(type.prototype instanceof Model)) {
      throw new TypeNotSupportedError();
    }
    return type.getOne(id) as Promise<T | null>;
  }

  async delete(type: ModelClass<any>, id: string): Promise<boolean> {
    const res = await type.deleteOne({ _id: new ObjectID(id) });
    return res.deletedCount === 1;
  }
}
