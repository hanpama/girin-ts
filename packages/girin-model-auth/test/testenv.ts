import { MongoClient } from 'mongodb';
import { setEnvironment } from 'girin-model';


export async function prepareTestClient() {
  const client = await MongoClient.connect('mongodb://test:verystrongpassword@localhost:27017', {
    authSource: 'admin',
    useNewUrlParser: true,
  });
  const dbName = 'girinmodelauth';
  setEnvironment({ client, dbName });
  return client;
}
