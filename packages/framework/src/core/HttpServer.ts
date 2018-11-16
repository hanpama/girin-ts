import { Module } from '@girin/environment';
import { getGlobalMetadataStorage, GraphQLTypeIndex } from '@girin/typelink';
import * as http from 'http';
import * as net from 'net';
import { ApolloServer, Config as ApolloServerConfig, CorsOptions, GraphQLUpload } from 'apollo-server-express';
import { GraphQLDirective, GraphQLEnumType, GraphQLInt } from 'graphql';

import { SchemaBuilder } from './SchemaBuilder';
import { app, contextMap } from '../global';


export interface HttpServerConfigs {
  apollo?: Pick<ApolloServerConfig,
    'schemaDirectives' |
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
  listen?: net.ListenOptions;
  cors?: CorsOptions;
}

export class HttpServer extends Module {
  get label() { return 'HttpServer'; }

  protected apolloServer: ApolloServer;
  protected httpServer: http.Server;

  constructor(public configs: HttpServerConfigs) {
    super();
  }

  onLoad() {
    const schemaModule = SchemaBuilder.object();

    getGlobalMetadataStorage().registerMetadata([
      new GraphQLTypeIndex({ typeInstance: GraphQLUpload, definitionClass: null }),
    ]);

    const CacheControlEnum = new GraphQLEnumType({
      name: 'CacheControlScope',
      values: { PUBLIC: {}, PRIVATE: {} },
    });

    schemaModule.schemaOptions.types.push(CacheControlEnum);
    schemaModule.schemaOptions.directives.push(new GraphQLDirective({
      name: 'cacheControl',
      locations: ['FIELD_DEFINITION', 'OBJECT', 'INTERFACE'],
      args: {
        maxAge: { type: GraphQLInt },
        scope: { type: CacheControlEnum },
      }
    }));
  }

  async onBootstrap() {
    await SchemaBuilder.bootstrap();

    const { configs } = this;
    const { schema } = SchemaBuilder.object();
    const apolloServerConfig = this.configs.apollo || {};

    // build context function from global contextMap
    const context = async (ctx: any) => {
      const results: any = { ...ctx };
      for (let [fieldName, ctxFn] of contextMap.entries()) {
        results[fieldName] = await ctxFn(ctx);
      }
      return results;
    };

    this.apolloServer = new ApolloServer({
      ...apolloServerConfig,
      schema,
      context,
    });
    this.apolloServer.applyMiddleware({
      app,
      path: '/graphql',
      bodyParserConfig: { limit: '50mb' },
      cors: typeof configs.cors !== 'undefined' ? configs.cors : { origin: '*' },
    });
    this.httpServer = http.createServer(app);

    if (apolloServerConfig.subscriptions) {
      this.apolloServer.installSubscriptionHandlers(this.httpServer);
    }

    return new Promise<void>((resolve, reject) => {
      this.httpServer.once('listening', () => resolve());
      this.httpServer.on('error', err => reject(err));
      this.httpServer.listen(configs.listen);
    });
  }

  async onDestroy() {
    await this.httpServer.close();
  }
}
