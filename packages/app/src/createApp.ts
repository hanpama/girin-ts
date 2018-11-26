import { environment, Environment } from '@girin/environment';
import { HttpServer, HttpServerConfigs, SchemaBuilder, SchemaBuilderConfigs } from '@girin/framework';
import { Auth, AuthConfigs } from '@girin/auth';
import MediaModule, { MediaModuleConfigs } from '@girin/media';
import FSObjectStorage from '@girin/objectstorage-fs';


export interface GirinTypeORMAppConfigs {
  schema: SchemaBuilderConfigs;
  server?: HttpServerConfigs;
  auth?: AuthConfigs<any>;
  media?: MediaModuleConfigs<any>;
  mediaRoot?: string;
}

export function createApp(configs: GirinTypeORMAppConfigs): Environment {
  environment
  .load(new SchemaBuilder(configs.schema))
  .load(new HttpServer(configs.server || {}));

  if (configs.auth) {
    environment.load(new Auth(configs.auth));
  }

  if (configs.media) {
    environment.load(new FSObjectStorage({ dir: configs.mediaRoot || 'media' }));
    environment.load(new MediaModule(configs.media));
  }
  return environment;
}
