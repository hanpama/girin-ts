import { environment, Environment } from '@girin/environment';
import { HttpServer, HttpServerConfigs, SchemaBuilder, SchemaBuilderConfigs } from '@girin/framework';
import LocalAuth, { LocalAuthConfigs } from '@girin/auth-local';
import MediaModule, { MediaModuleConfigs } from '@girin/media';
import FSObjectStorage from '@girin/objectstorage-fs';

import { TypeORMFrameworkDatastore } from './TypeORMFrameworkDatastore';


export interface GirinTypeORMAppConfigs {
  schema: SchemaBuilderConfigs;
  server?: HttpServerConfigs;
  auth?: LocalAuthConfigs<any>;
  media?: MediaModuleConfigs<any>;
  mediaRoot?: string;
}

export function createApp(configs: GirinTypeORMAppConfigs): Environment {
  environment
  .load(new SchemaBuilder(configs.schema))
  .load(new HttpServer(configs.server || {}))
  .load(new TypeORMFrameworkDatastore({}));

  if (configs.auth) {
    environment.load(new LocalAuth(configs.auth));
  }

  if (configs.media) {
    environment.load(new FSObjectStorage({ dir: configs.mediaRoot || 'media' }));
    environment.load(new MediaModule(configs.media));
  }
  return environment;
}
