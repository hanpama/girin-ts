import { NeDBFrameworkDatastore, NeDBModel, field, testFrameworkDatastoreSpec } from '../src';


test('NeDBFrameworkDatastore', async () => {
  const mod = new NeDBFrameworkDatastore();

  class TypeA extends NeDBModel {
    @field() foo: string;
  }
  class TypeB extends NeDBModel {
    @field() bar: string;
  }

  await testFrameworkDatastoreSpec(mod, TypeA, TypeB);
});
