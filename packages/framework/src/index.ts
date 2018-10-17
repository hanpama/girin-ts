import { environment } from '@girin/environment';
import { MongoDBModule, MongoDBModuleConfigs } from '@girin/mongodb/module';
import SchemaModule, { SchemaModuleConfigs } from './schema';
import ServerModule, { ServerModuleConfigs } from './server';
import { AuthLocalModule, AuthLocalModuleConfigs } from './auth-local';


export type GirinAppOptions = {
  MONGO?: MongoDBModuleConfigs,
  SCHEMA: SchemaModuleConfigs,
  SERVER?: ServerModuleConfigs,
  AUTH?: AuthLocalModuleConfigs<any>,
};

export function girin(options: GirinAppOptions) {
  environment
    .load(new SchemaModule(options.SCHEMA))
    .load(new ServerModule(options.SERVER || {}));

  if (options.MONGO) { environment.load(new MongoDBModule(options.MONGO)); }
  if (options.AUTH) { environment.load(new AuthLocalModule(options.AUTH)); }

  return environment;
}
