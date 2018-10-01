import { globalEnvironment } from "@girin/environment";
import MongoDBModule from "../../mongodb/module";
import AuthLocalModule from "../module";
import { BaseUser } from "..";
import ServerModule from "../../core/server";
import SchemaModule from "../../core/schema";


export function prepareTestEnv(Query: Function) {
  return globalEnvironment
  .load(MongoDBModule, {
    MONGO_URL: 'mongodb://test:verystrongpassword@localhost:27017',
    MONGO_DBNAME: 'mongorelay',
    MONGO_CLIENT_OPTIONS: { useNewUrlParser: true },
  })
  .load(SchemaModule, { Query })
  .load(ServerModule, {
    SERVER_APOLLO: {},
    SERVER_LISTEN: { host: 'localhost', port: 11111 }
  })
  .load(AuthLocalModule, {
    AUTH_MODEL: BaseUser,
    AUTH_PASSWORD_SALT: 'SALT',
    AUTH_JWT_SECRET_KEY: 'VERYSTRONGSECRETKEY',
  })
  .run();
}

export function cleanUpTestEnv() {
  return globalEnvironment.destroy();
}
