import { defineType, gql, getType } from '../src';
import { GraphQLSchema, graphql } from 'graphql';



test('Type definition with plain resolver map', async () => {

  const QueryType = defineType(() => gql`
    type Query {
      hello: String
      post(id: String!): ${PostType}!
    }
  `)({
    hello() {
      return 'World';
    },
    post(_source: null, args: { id: string }) {
      return {
        id: args.id,
        title: `Post: ${args.id}`,
      };
    }
  });

  const PostType = defineType(() => gql`
    type Post {
      id: String!
      title: String!
    }
  `)({});

  const schema = new GraphQLSchema({ query: getType(QueryType) });
  let res = await graphql({ schema, source: `{ hello }` });
  expect(res).toEqual({ data: { hello: 'World' } });

  res = await graphql({ schema, source: `{ post(id: "1121") { id, title } }`});
  expect(res).toEqual({ data: { post: { id: '1121', title: 'Post: 1121' } } });
});
