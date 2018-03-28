import { GraphQLServer } from 'graphql-yoga';
import { GraphQLSchema } from 'graphql';
import { getGraphQLType } from 'girin';
import { Query, Mutation } from './types';


export const schema = new GraphQLSchema({
  query: getGraphQLType(Query),
  mutation: getGraphQLType(Mutation),
});

const port = 8080;
const server = new GraphQLServer({ schema });

server.start({ port }).then(() => {
  console.log(`Runnig GraphQL server on ${port}`);
});
