import { NeDBFrameworkDatastore, NeDBModel, field } from '@girin/framework';
import { testFrameworkDatastoreSpec } from '@girin/framework';


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
