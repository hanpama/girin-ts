import { Module } from "@girin/environment";
import { ApolloServer, Config as ApolloServerConfig, CorsOptions } from 'apollo-server-express';
import * as express from 'express';
import { GraphQLDirective, GraphQLEnumType, GraphQLInt } from 'graphql';
import * as http from 'http';
import * as net from 'net';

import SchemaModule from './schema';



export interface ServerModuleConfigs {
  SERVER_APOLLO?: Pick<ApolloServerConfig,
    'schemaDirectives' |
    'context' |
    'introspection' |
    'mocks' |
    'mockEntireSchema' |
    'engine' |
    'extensions' |
    'persistedQueries' |
    'subscriptions' |
    'uploads' |
    'playground'
  >;
  SERVER_LISTEN?: net.ListenOptions;
  SERVER_CORS?: CorsOptions;
}

export default class ServerModule extends Module<ServerModuleConfigs, http.Server> {
  public app: express.Express;
  public context: (context: { req: any }) => { req: any } = ctx => ctx;

  protected apolloServer: ApolloServer;
  protected httpServer: http.Server;

  configure() {
    const schemaModule = this.environment.get(SchemaModule);
    this.app = express();

    const CacheControlEnum = new GraphQLEnumType({
      name: 'CacheControlScope',
      values: { PUBLIC: {}, PRIVATE: {} },
    });

    schemaModule.schemaOptions.types.push(CacheControlEnum)
    schemaModule.schemaOptions.directives.push(new GraphQLDirective({
      name: 'cacheControl',
      locations: ['FIELD_DEFINITION', 'OBJECT', 'INTERFACE'],
      args: {
        maxAge: { type: GraphQLInt },
        scope: { type: CacheControlEnum },
      }
    }));
  }

  async bootstrap() {
    const { configs, environment } = this;
    const schema = await environment.bootstrap(SchemaModule);
    const apolloServerConfig = this.configs.SERVER_APOLLO || {};

    this.apolloServer = new ApolloServer({ ...apolloServerConfig, schema });
    this.apolloServer.applyMiddleware({
      app: this.app,
      path: '/',
      bodyParserConfig: { limit: '50mb' },
      cors: typeof configs.SERVER_CORS !== 'undefined' ? configs.SERVER_CORS : { origin: '*' },
    });
    this.httpServer = http.createServer(this.app);

    if (apolloServerConfig.subscriptions) {
      this.apolloServer.installSubscriptionHandlers(this.httpServer);
    }

    return new Promise<http.Server>((resolve, reject) => {
      this.httpServer.once('listening', () => resolve(this.httpServer));
      this.httpServer.on('error', err => reject(err));
      this.httpServer.listen(configs.SERVER_LISTEN);
    });
  }

  async destroy() {
    await this.httpServer.close();
  }
}
