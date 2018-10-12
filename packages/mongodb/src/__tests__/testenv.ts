import { environment } from "@girin/environment";
import { MongoDBModule } from "../module";


export function prepareTestEnv() {
  return environment
  .load(new MongoDBModule({
    URL: 'mongodb://test:verystrongpassword@localhost:27017',
    DBNAME: 'mongorelay',
    CLIENT_OPTIONS: { useNewUrlParser: true },
  }))
  .run();
}

export function cleanUpTestEnv() {
  return environment.destroy();
}
