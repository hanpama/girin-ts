import { MongoClient } from 'mongodb';
import { setEnvironment } from '../src';


export async function prepareTestClient() {
  const client = await MongoClient.connect('mongodb://test:verystrongpassword@localhost:27017', {
    authSource: 'admin',
    useNewUrlParser: true,
  });
  const dbName = 'mongorelay';
  setEnvironment({ client, dbName });
  return client;
}
