import { GraphQLSchema, graphql } from "graphql";
import { defineType, gql, getGraphQLType } from "../src";


@defineType(gql`
  type Query {
    foo: String
  }
`)
class Query {
  static foo() {
    return 'Foo';
  }
}


@defineType(gql`
  extends type Query {
    bar: String
  }
`)
class BarQuery {
  static bar() {
    return 'Bar';
  }
}

const schema = new GraphQLSchema({
  query: getGraphQLType(Query),
});

describe('Extends with SDL', () => {
  it('allows to extend types with ', async () => {
    const results = await graphql({ schema, source: `
      query {
        foo
        bar
      }
    `});
    expect(results).toEqual({ data: {
      foo: 'Foo',
      bar: 'Bar',
    }});
  });
});
