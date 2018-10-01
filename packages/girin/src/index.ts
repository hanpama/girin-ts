import { globalEnvironment } from "@girin/environment";
import MongoDBModule, { MongoDBModuleConfigs } from "./mongodb/module";
import SchemaModule, { SchemaModuleConfigs } from "./core/schema";
import ServerModule, { ServerModuleConfigs } from "./core/server";
import AuthLocalModule, { AuthLocalModuleConfigs } from "./auth-local/module";


export type GirinAppOptions = MongoDBModuleConfigs
  & SchemaModuleConfigs
  & ServerModuleConfigs
  & AuthLocalModuleConfigs;

export function app(options: GirinAppOptions) {
  return globalEnvironment
    .load(MongoDBModule, options)
    .load(SchemaModule, options)
    .load(ServerModule, options)
    .load(AuthLocalModule, options)
    .run();
}
