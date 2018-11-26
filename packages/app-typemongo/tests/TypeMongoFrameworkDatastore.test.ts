import { MongoClient } from 'mongodb';
import { clientRegistry, Model, field } from '@girin/typemongo';
import { testFrameworkDatastoreSpec } from '@girin/framework';
import { TypeMongoFrameworkDatastore } from '../src';


class Foo extends Model {
  @field() foo: string;
}

class Bar extends Model {
  @field() bar: string;
}


describe('TypeMongoFrameworkDatstore', () => {
  const dataStore = new TypeMongoFrameworkDatastore();
  let client: MongoClient;

  beforeAll(async () => {
    client = new MongoClient(
      'mongodb://test:verystrongpassword@localhost:27017/app-typemongo', {
        useNewUrlParser: true, authSource: 'admin'
      }
    );
    await client.connect();
    clientRegistry.set(client);
  });

  afterAll(async () => {
    await client.db().dropDatabase();
    await client.close();
  });

  it('meets specification', () => testFrameworkDatastoreSpec(dataStore, Foo, Bar));
});
