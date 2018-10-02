import { Module } from "@girin/environment";
import { MongoClient, MongoClientOptions } from "mongodb";


export interface MongoDBModuleConfigs {
  MONGO_URL: string;
  MONGO_DBNAME?: string;
  MONGO_CLIENT_OPTIONS?: MongoClientOptions;
}

export default class MongoDBModule extends Module<MongoDBModuleConfigs, MongoDBModule> {
  configure() {
    const { configs } = this;
    this.client = new MongoClient(configs.MONGO_URL, configs.MONGO_CLIENT_OPTIONS);
    this.dbName = configs.MONGO_DBNAME || 'test';
  }
  async bootstrap() {
    await this.client.connect();
    return this;
  }
  async destroy() {
    await this.client.close();
  }

  public client: MongoClient;
  public dbName: string;
  public get db() {
    return this.client.db(this.dbName);
  }
}
