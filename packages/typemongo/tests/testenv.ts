import { clientRegistry } from '../src';
import { MongoClient } from 'mongodb';


let client: MongoClient;

export function prepareTestEnv() {
  client = new MongoClient(
    'mongodb://test:verystrongpassword@localhost:27017/mongorelay', {
      useNewUrlParser: true, authSource: 'admin'
    }
  );
  clientRegistry.set(client);
  return client.connect();
}

export function cleanUpTestEnv() {
  return client.close();
}
