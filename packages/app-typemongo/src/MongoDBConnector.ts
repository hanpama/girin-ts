import { Module } from '@girin/environment';
import { MongoClient } from 'mongodb';
import { clientRegistry } from '@girin/typemongo';


export class MongoDBConnector extends Module {
  constructor(public client: MongoClient) { super(); }

  async onInit() { clientRegistry.set(this.client); }

  async onBootstrap() { await this.client.connect(); }

  async onDestroy() { await this.client.close(); }
}
