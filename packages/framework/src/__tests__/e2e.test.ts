import { User } from '../auth-local';
import { testUpAndRunning } from './e2e/up-and-running';
import { prepareTestEnv } from './testenv';
import { testAuth } from './e2e/auth';
import { Query, Mutation } from '@girin/typelink';
import { MongoDBModule } from '../../../mongodb';



describe('Girin', () => {
  const app = prepareTestEnv(User, Query, Mutation);

  beforeAll(() => app.run());
  afterAll(async () => {
    await MongoDBModule.object().db.dropDatabase();
    await app.destroy();
  });

  describe('Up and Running', testUpAndRunning);
  describe('Auth', testAuth);
  // await testAuth();

});
