import { environment } from '@girin/environment';
import { MongoDBModule } from '@girin/mongodb';
import { fetch } from 'apollo-server-env';

import SchemaModule from '../schema';
import ServerModule from '../server';
import { AuthLocalModule } from '../auth-local';


const host = 'localhost';
const port = 8080;
export const url = `http://${host}:${port}`;

export function prepareTestEnv(User: any, Query: Function, Mutation?: Function) {
  return environment
  .load(new MongoDBModule({
    URL: 'mongodb://test:verystrongpassword@localhost:27017',
    DBNAME: 'mongorelay',
    CLIENT_OPTIONS: { useNewUrlParser: true },
  }))
  .load(new SchemaModule({ Query, Mutation }))
  .load(new ServerModule({
    LISTEN: { host, port }
  }))
  .load(new AuthLocalModule({
    USER: User,
    JWT_SECRET_KEY: 'VERYSTRONGSECRETKEY',
  }));
}

export async function query(doc: string, headers = {}): Promise<{ data: any, errors: any }> {
  const res = await fetch(url, {
    method: 'POST',
    headers: Object.assign({ 'Content-Type': 'application/json' }, headers),
    body: JSON.stringify({ query: doc }),
  });
  return res.json();
}
