import * as http from 'http';
import { Readable } from 'stream';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';
import FormData from 'form-data';

import { HttpServer } from '../core/HttpServer';


export interface TestServerModuleConfigs {
  host: string;
  port: number;
}

export class TestHttpServer extends HttpServer {

  constructor(configs?: TestServerModuleConfigs) {
    const randomStr = randomBytes(12).toString('hex');
    const socketPath = join(tmpdir(), randomStr);

    const port = configs && configs.port;
    const host = configs && configs.host;
    const listen = (host && port)
      ? { host, port }
      : { path: socketPath };

    super({ listen });

    this.requestOptions = (host && port)
    ? { host, port }
    : { socketPath };
  }

  protected requestOptions: any;

  public getClient() {
    return new TestClient(this.requestOptions);
  }
}

export class TestClient {
  constructor(public requestOptions: { host: string, port: number } | { socketPath: string }) {}

  async request(method: string, path: string, body?: any, headers: any = {}) {
    return new Promise<{ res: http.IncomingMessage, body: Buffer }>((resolve, reject) => {
      const req = http.request({
        ...this.requestOptions,
        method,
        headers,
        path,
      });
      req.once('error', reject);
      req.once('response', async (res: http.IncomingMessage) => {
        const bufs: Buffer[] = [];
        res.on('data', buf => { bufs.push(buf); });
        res.on('end', () => resolve({ res, body: Buffer.concat(bufs) }));
      });
      if (!body) {
        req.end();
      }
      else if (typeof body.pipe === 'function') {
        body.pipe(req);
        body.once('finish', () => req.end());
      } else {
        req.write(body);
        req.end();
      }
    });
  }

  async sendQuery(data: { query: string, variables?: any }, headers: any = {}) {
    const { body } = await this.request('POST', '/graphql', JSON.stringify(data), {
      'Content-Type': 'application/json',
      ...headers,
    });

    return JSON.parse(body.toString());
  }

  async sendQueryWithFiles(data: { query: string, map: any, variables: any, files?: Readable[] }, headers: any = {}) {

    const form = new FormData();
    const { query, map, variables, files } = data;

    form.append('operations', JSON.stringify({ query, variables }));
    form.append('map', JSON.stringify(map));

    if (files) {
      files.forEach((file, idx) => {
        form.append(String(idx), file);
      });
    }

    const { body } = await this.request('POST', '/graphql', form, {
      ...form.getHeaders(),
      ...headers,
    });

    return JSON.parse(body.toString());
  }
}