import { Db, Collection, ObjectID } from "mongodb";
import * as DataLoader from 'dataloader';

import { ModelClass, Document } from "./Model";
import { CompositeKeySorter } from '../utils';
import { MongoDBModule } from "../module";


function compareObjectID(k1: ObjectID, k2: ObjectID) {
  const k1h = String(k1);
  const k2h = String(k2);
  if (k1h > k2h) {
    return 1;
  } else if (k1h === k2h) {
    return 0;
  } else  {
    return -1;
  }
}

export class ModelManager {
  constructor(public modelClass: ModelClass<any>, public mod: MongoDBModule) {
    this.dataloader = new DataLoader(this.batchQuery, { cache: false });
  }

  public dataloader: DataLoader<ObjectID, Document>;

  batchQuery = async (keys: ObjectID[]) => {
    const res = await this.collection.find({ _id: { $in: keys }}).toArray();
    // if the returned array has same length with keys, no problem
    if (res.length === keys.length) { return res; }

    // but when its length is smaller than keys' we should find which key has no matched document
    const cks = new CompositeKeySorter<ObjectID>(res.map(doc => doc._id), compareObjectID);
    return keys.map(key => {
      const idx = cks.indexOf(key);
      return idx !== -1 ? res[idx] : null;
    });
  }

  get db(): Db {
    const { dbName, client } = this.mod;
    return client.db(dbName);
  }

  get collection(): Collection {
    return this.db.collection(this.modelClass.collectionName);
  }
}
