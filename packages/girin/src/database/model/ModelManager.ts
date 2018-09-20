import { Model, ModelClass } from "./Model";
import * as DataLoader from 'dataloader';
import { CompositeKeySorter } from '../utils/CompositeKeySorter';
import { Db, Collection } from "mongodb";


export class ModelManager<T extends Model> {
  constructor(public modelClass: ModelClass<T>) {
    this.dataloader = new DataLoader(this.batchQuery, { cache: false });
  }

  public dataloader: DataLoader<any, T>;

  batchQuery = async (keys: any[]) => {
    const res = await this.collection.find({ _id: { $in: keys }}).toArray();
    if (res.length === keys.length) {
      return res;
    } else {
      const cks = new CompositeKeySorter(keys);
      const alignedRes = new Array(keys.length);

      res.forEach(doc => {
        const idx = cks.indexOf(doc._id);
        if (idx !== -1) { alignedRes[idx] = doc; }
      })
      return alignedRes;
    }
  }

  get db(): Db {
    const { dbName, client } = this.modelClass.configs;
    if (!client) {
      throw new Error('No Client is provided');
    }
    return client.db(dbName);
  }

  get collection(): Collection {
    return this.db.collection(this.modelClass.collectionName);
  }
}
