import { testObjectStorageSpec } from '@girin/framework';

import { GridFSObjectStorage } from '../src';


describe('filestroage-gridfs', () => {
  const mod = new GridFSObjectStorage({
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
  afterAll(async () => {
    await mod.gridFSBucketMap.get('test')!.drop();
    await mod.onDestroy();
  });

  it('meets specification', async () => {
    await testObjectStorageSpec(mod);
  });
});
