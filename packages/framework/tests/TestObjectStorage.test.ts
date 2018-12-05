import { testObjectStorageSpec, TestObjectStorage } from '../src';


test('TestObjectStorageModule', async () => {
  await testObjectStorageSpec(new TestObjectStorage());
});
