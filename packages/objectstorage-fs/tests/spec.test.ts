import { join } from 'path';

import { testObjectStorageSpec } from '@girin/framework';

import { FSObjectStorage } from '../src';
import { remove } from 'fs-extra';


describe('objectstorage-fs', () => {
  const mod = new FSObjectStorage({
    dir: join('temp', 'objectstorage-fs'),
  });

  beforeAll(() => mod.onBootstrap());
  afterAll(async () => remove(join('temp', 'objectstorage-fs')));

  it('meets the specification', async () => testObjectStorageSpec(mod));
});
