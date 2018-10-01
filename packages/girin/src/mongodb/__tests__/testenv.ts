import { globalEnvironment } from "@girin/environment";
import MongoDBModule from "../module";


export function prepareTestEnv() {
  return globalEnvironment
  .load(MongoDBModule, {
    MONGO_URL: 'mongodb://test:verystrongpassword@localhost:27017',
    MONGO_DBNAME: 'mongorelay',
    MONGO_CLIENT_OPTIONS: { useNewUrlParser: true },
  })
  .run();
}

export function cleanUpTestEnv() {
  return globalEnvironment.destroy();
}
