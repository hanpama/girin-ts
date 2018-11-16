import FSObjectStorage from '@girin/objectstorage-fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { testObjectStorageSpec } from '@girin/framework';


describe('objectstorage-fs', () => {

  it('meets the specification', async () => {
    const mod = new FSObjectStorage({
      dir: join(tmpdir(), 'objectstorage-fs'),
    });

    await mod.onBootstrap();

    await testObjectStorageSpec(mod);
  });
});
