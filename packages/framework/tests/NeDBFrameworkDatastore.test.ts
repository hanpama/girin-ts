import { NeDBFrameworkDatastore, NeDBModel, nedbField, testFrameworkDatastoreSpec } from '../src';


test('NeDBFrameworkDatastore', async () => {
  const mod = new NeDBFrameworkDatastore();

  class TypeA extends NeDBModel {
    @nedbField() foo: string;
  }
  class TypeB extends NeDBModel {
    @nedbField() bar: string;
  }

  await testFrameworkDatastoreSpec(mod, TypeA, TypeB);
});
