import { GraphQLServer } from 'graphql-yoga';
import { Definition, gql, getGraphQLType } from 'girin';
import { GraphQLSchema } from 'graphql';


@Definition(gql`
  type Query {
    hello: String
  }
`)
class Query {
  static hello() {
    return 'Hello, world!';
  }
}

export const schema = new GraphQLSchema({
  query: getGraphQLType(Query),
});

const port = 8080;
const server = new GraphQLServer({ schema });

server.start({ port }).then(() => {
  console.log(`Runnig GraphQL server on ${port}`);
});
