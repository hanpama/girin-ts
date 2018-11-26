import { createApp } from '../src';
import { defineType, gql } from '@girin/typelink';
import { TestHttpServer, TestClient } from '@girin/framework';
import { clientRegistry } from '@girin/typemongo';


@defineType(gql`
  type Query {
    hello: String!
  }
`)
class Query {
  static hello() { return 'girin'; }
}

const testApp = createApp({
  schema: { Query },
  mongodb: {
    url: 'mongodb://test:verystrongpassword@localhost:27017/app-typemongo-createApp',
    clientOptions: {
      useNewUrlParser: true, authSource: 'admin'
    }
  },
}).load(new TestHttpServer());


describe('createApp', () => {
  let client: TestClient;

  beforeAll(async () => {
    await testApp.run();
    client = TestHttpServer.object().getClient();
  });

  afterAll(async () => {
    await clientRegistry.get().db().dropDatabase();
    await testApp.destroy();
  });

  it('works', async () => {
    const { data, errors } = await client.sendQuery({ query: `{ hello }`});

    expect(errors).toBeUndefined();
    expect(data).toEqual({ hello: 'girin' });
  });
});
