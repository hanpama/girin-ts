import { testObjectStorageSpec } from '@girin/framework';

import ObjectStorageGridFSModule from '../src';


describe('filestroage-gridfs', () => {
  const mod = new ObjectStorageGridFSModule({
    url: `mongodb://localhost:27017/test`,
    clientOptions: {
      useNewUrlParser: true,
      auth: {
        user: 'test',
        password: 'verystrongpassword',
      },
      authSource: 'admin',
    },
  });
  beforeAll(() => mod.onBootstrap());
  afterAll(() => mod.onDestroy());

  it('meets specification', async () => {
    await testObjectStorageSpec(mod);
  });
});
