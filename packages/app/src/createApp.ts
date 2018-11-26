import { environment, Environment } from '@girin/environment';
import { HttpServer, HttpServerConfigs, SchemaBuilder, SchemaBuilderConfigs } from '@girin/framework';
import { Auth, AuthConfigs } from '@girin/auth';
import { MediaServiceConfigs, MediaService } from '@girin/mediaservice';
import { FSObjectStorage } from '@girin/objectstorage-fs';


export interface GirinAppConfigs {
  schema: SchemaBuilderConfigs;
  server?: HttpServerConfigs;
  auth?: AuthConfigs<any>;
  media?: MediaServiceConfigs<any>;
  mediaRoot?: string;
}

export function createApp(configs: GirinAppConfigs): Environment {
  environment
  .load(new SchemaBuilder(configs.schema))
  .load(new HttpServer(configs.server || {}));

  if (configs.auth) {
    environment.load(new Auth(configs.auth));
  }

  if (configs.media) {
    environment.load(new FSObjectStorage({ dir: configs.mediaRoot || 'media' }));
    environment.load(new MediaService(configs.media));
  }
  return environment;
}
