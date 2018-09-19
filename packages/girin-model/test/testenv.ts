import { MongoClient } from 'mongodb';
import { setEnvironment } from '../src';


export async function prepareTestClient() {
  let client: MongoClient;
  try {
    client = await MongoClient.connect('mongodb://test:verystrongpassword@localhost:27017', {
      authSource: 'admin',
      useNewUrlParser: true,
    });
  } catch(e) {
    console.error('Cannot connect to database. Check your MongoDB server is up.');
    throw e;
  }
  const dbName = 'girinmodel';
  setEnvironment({ client, dbName });
  return client;
}
