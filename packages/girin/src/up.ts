import { GraphQLSchema, GraphQLSchemaConfig } from "graphql";
import { ApolloServer } from 'apollo-server';
import { TypeArg, getGraphQLType } from 'girin-typelinker';
import { ListenOptions } from "net";
import { MongoClient, MongoClientOptions } from "mongodb";
import { setEnvironment } from "girin-model";


export interface UpOptions {
  Query: TypeArg;
  Mutation?: TypeArg;
  Subscription?: TypeArg ;
  types?: TypeArg[];
  listen?: ListenOptions;
  mongo?: {
    url: string,
    dbName: string,
    options?: MongoClientOptions,
  };
}

export async function up(options: UpOptions) {
  const schemaOptions: GraphQLSchemaConfig = {
    query: getGraphQLType(options.Query),
    mutation: options.Mutation && getGraphQLType(options.Mutation),
    subscription: options.Subscription && getGraphQLType(options.Subscription),
    types: options.types && options.types.map(arg => getGraphQLType(arg)),
  };

  const schema = new GraphQLSchema(schemaOptions);
  const server = new ApolloServer({ schema });

  if (options.mongo) {
    const client = new MongoClient(options.mongo.url, options.mongo.options);
    await client.connect();

    const dbName = options.mongo.dbName;
    setEnvironment({ client, dbName });
  }
  const serverInfo = await server.listen(options.listen || { host: 'localhost', port: 4000 });

  return { schema, server, serverInfo };
}
