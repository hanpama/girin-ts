import { environment } from '@girin/environment';

import { SchemaBuilder } from '..';
import { TestHttpServer, NeDBFrameworkDatastore, TestObjectStorage } from '.';

/**
 * @param port if not provided, creates a temporary socket file to run server.
 */
export function prepareTestEnv(options: { Query: Function, Mutation?: Function, port?: number}) {
  const { Query, Mutation, port } = options;
  return environment
    .load(new SchemaBuilder({ Query, Mutation }))
    .load(new NeDBFrameworkDatastore())
    .load(new TestObjectStorage())
    .load(new TestHttpServer(port ? { port, host: 'localhost' } : undefined));
}

export function destroyTestEnv() {
  return environment.destroy();
}
