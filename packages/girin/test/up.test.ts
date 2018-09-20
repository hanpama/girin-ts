import { typedef, gql, up } from "../src";
import { fetch } from "apollo-server-env";
import { introspectionQuery } from "graphql";

describe('Up', () => {
  it('runs server', async () => {

    @typedef(gql`
      type Query {
        hello: String!
      }
    `)
    class Query {
      static hello() { return 'World👋'; }
    }

    const { server } = await up({ Query });
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

    server.stop();
  })
});
