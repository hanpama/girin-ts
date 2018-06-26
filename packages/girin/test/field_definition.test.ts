import { Definition, gql, mountField, ObjectType, getGraphQLType, FieldMount } from "../src";
import { GraphQLObjectType, GraphQLSchema, graphql } from "graphql";

describe('field definition', () => {

  test('static resolvers', async () => {
    @Definition.define(gql`
      type FooFields {
        bar(arg1: Int!): String!
      }
    `)
    class FooFields {
      static bar(source: any, args: { arg1: number }) {
        return `Foobar-${args.arg1}`;
      }
    }
    const barField = mountField(FooFields.bar);

    expect(barField).toBeInstanceOf(FieldMount);
    expect(barField.mountName).toBe('bar');

    const bazField = mountField(FooFields.bar, 'baz');
    expect(bazField.mountName).toBe('baz');

    @ObjectType.define(gql`
      type Query {
        ${barField}
        ${bazField}
      }
    `)
    class Query {}

    const queryType: GraphQLObjectType = getGraphQLType(Query);

    expect(queryType.getFields().bar).not.toBeUndefined();
    expect(queryType.getFields().baz).not.toBeUndefined();

    const schema = new GraphQLSchema({ query: getGraphQLType(Query) });

    const results = await graphql({ schema, source: `
      query {
        bar(arg1: 3)
        baz(arg1: 4)
      }
    ` });

    expect(results).toEqual({
      data: {
        bar: 'Foobar-3',
        baz: 'Foobar-4',
      }
    });

  });
});
