import { environment, Environment } from '@girin/environment';
import { HttpServer, HttpServerConfigs, SchemaBuilder, SchemaBuilderConfigs } from '@girin/framework';
import { MediaService, MediaServiceConfigs } from '@girin/mediaservice';
import { FSObjectStorage, FSObjectStorageConfigs } from '@girin/objectstorage-fs';
import { GridFSObjectStorage, GridFSObjectStorageConfigs } from '@girin/objectstorage-gridfs';
import { AuthConfigs, Auth } from '@girin/auth';
import { AccountsPassword, AccountsPasswordConfigs } from '@girin/accounts-password';

import { MongoClientOptions, MongoClient } from 'mongodb';

import { TypeMongoFrameworkDatastore } from './TypeMongoFrameworkDatastore';
import { MongoDBConnector } from './MongoDBConnector';


export interface GirinTypeMongoAppConfigs {
  schema: SchemaBuilderConfigs;
  server?: HttpServerConfigs;
  auth?: AuthConfigs<any> & AccountsPasswordConfigs;
  media?: (MediaServiceConfigs<any> & GridFSObjectStorageConfigs)
    | (MediaServiceConfigs<any> & FSObjectStorageConfigs);

  mongodb: {
    url: string;
    clientOptions?: MongoClientOptions;
  };
}

export function createApp(configs: GirinTypeMongoAppConfigs): Environment {

  environment
  .load(new SchemaBuilder(configs.schema))
  .load(new HttpServer(configs.server || {}))
  .load(new TypeMongoFrameworkDatastore());

  if (configs.auth) {
    environment.load(new Auth(configs.auth));
    environment.load(new AccountsPassword(configs.auth));
  }

  if (configs.media) {
    if (typeof (configs.media as FSObjectStorageConfigs).dir === 'string') {
      environment.load(new FSObjectStorage(configs.media as FSObjectStorageConfigs));
    } else {
      const mediaConfigs = configs.media as GridFSObjectStorageConfigs;

      const objectStorageConfigs: GridFSObjectStorageConfigs = {
        url: mediaConfigs.url || configs.mongodb.url,
        clientOptions: mediaConfigs.clientOptions || configs.mongodb.clientOptions,
        gridFSOptions: mediaConfigs.gridFSOptions,
      };
      environment.load(new GridFSObjectStorage(objectStorageConfigs));
    }
    environment.load(new MediaService(configs.media));
  }

  environment.load(new MongoDBConnector(
    new MongoClient(configs.mongodb.url, configs.mongodb.clientOptions))
  );

  return environment;
}
