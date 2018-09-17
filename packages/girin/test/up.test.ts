import { ObjectType, gql, up } from "../src";
import { fetch } from "apollo-server-env";

describe('Up', () => {
  it('runs server', async () => {

    @ObjectType.define(gql`
      type Query {
        hello: String!
      }
    `)
    class Query {
      static hello() { return 'World👋'; }
    }

    const { server } = await up({ Query });

    const res = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `{ hello }` }),
    });

    expect(await res.json()).toEqual({ data: { hello: 'World👋' }});

    server.stop();
  })
});
