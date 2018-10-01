import { fetch } from "apollo-server-env";
import { typedef, gql } from '@girin/typelinker';
import { introspectionQuery } from "graphql";

import SchemaModule from "../core/schema";
import ServerModule from "../core/server";
import MongoDBModule from "../mongodb/module";
// import LocalAuthModule from "../auth-local/module";
import { globalEnvironment } from "@girin/environment";


@typedef(gql`
type Query {
  hello: String!
}
`)
class Query {
  static hello() { return 'World👋'; }
}

describe('Up', () => {
  it('runs server', async () => {

    await globalEnvironment
      .load(SchemaModule, { Query })
      .load(MongoDBModule, {
        MONGO_URL: 'mongodb://test:verystrongpassword@localhost:27017',
        MONGO_DBNAME: 'mongorelay',
        MONGO_CLIENT_OPTIONS: { useNewUrlParser: true },
      })
      .load(ServerModule, {
        SERVER_APOLLO: {},
        SERVER_LISTEN: { port: 4000, host: 'localhost' }
      })
      .run();

    const expectedURL = 'http://localhost:4000';
    let res: any;

    res = await fetch(expectedURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: introspectionQuery }),
    });
    expect(await res.json()).toMatchSnapshot();

    res = await fetch(expectedURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `{ hello }` }),
    });

    expect(await res.json()).toEqual({ data: { hello: 'World👋' }});

    await globalEnvironment.destroy();
  })
});
