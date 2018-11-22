import { ModelClass } from './models';
import { MongoClient } from 'mongodb';


class ClientRegistry {
  protected defaultClient: MongoClient;
  protected modelClientMap: Map<ModelClass<any>, MongoClient> = new Map();

  set(client: MongoClient, modelClass?: ModelClass<any>) {
    if (modelClass) {
      this.modelClientMap.set(modelClass, client);
    } else {
      this.defaultClient = client;
    }
  }
  get(modelClass?: ModelClass<any>) {
    if (modelClass) {
      return this.modelClientMap.get(modelClass) || this.defaultClient;
    } else {
      return this.defaultClient;
    }
  }
}

export const clientRegistry = new ClientRegistry();
