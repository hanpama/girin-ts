import { Module } from "@girin/environment";
import { MongoClient, MongoClientOptions, GridFSBucket, GridFSBucketOptions } from "mongodb";


export interface MongoDBModuleConfigs {
  URL: string;
  DBNAME?: string;
  CLIENT_OPTIONS?: MongoClientOptions;
}

export class MongoDBModule extends Module<MongoDBModule> {
  get label() { return 'Mongo'; }

  constructor(configs: MongoDBModuleConfigs) {
    super();
    this.client = new MongoClient(configs.URL, configs.CLIENT_OPTIONS);
    this.dbName = configs.DBNAME || 'test';
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

  public createGridFSBucket(options: GridFSBucketOptions): GridFSBucket {
    return new GridFSBucket(this.db, options);
  }
}
