import { FrameworkDatastore } from '../core/FrameworkDatastore';


interface FooConstructor {
  new(): { id: string, foo: string };
}
interface BarConstructor {
  new(): { id: string, bar: string };
}

export async function testFrameworkDatastoreSpec(
  datastore: FrameworkDatastore,
  TypeA: FooConstructor,
  TypeB: BarConstructor,
) {
  const typeAObject = new TypeA();
  typeAObject.foo = 'foo';
  const typeBObject = new TypeB();
  typeBObject.bar = 'bar';

  const savedTypeAObject = await datastore.save(typeAObject);
  const savedTypeBObject = await datastore.save(typeBObject);

  if (!(savedTypeAObject instanceof TypeA) || !(savedTypeBObject instanceof TypeB)) {
    throw new Error('Object returned by `save()` method should have same type of its first argument');
  }
  if (!savedTypeAObject.id || !savedTypeBObject.id) {
    throw new Error('Saved record should have `id` property');
  }

  let fetchedTypeAObject = await datastore.get(TypeA, savedTypeAObject.id);
  let fetchedTypeBObject = await datastore.get(TypeB, savedTypeBObject.id);

  if (!(fetchedTypeAObject instanceof TypeA) || !(fetchedTypeBObject instanceof TypeB)) {
    throw new Error('Object returned by `getById()` method should be an instance of its first argument');
  }

  const typeAObjectWithFooField = await datastore.find(TypeA, { foo: 'foo' });
  if (!(
    typeAObjectWithFooField && typeAObjectWithFooField.foo === 'foo'
  )) {
    throw new Error('Datastore should retrieve saved value by get query');
  }

  if (!(
    typeAObjectWithFooField instanceof TypeA
  )) {
    throw new Error('Object returned by `get()` method should be an instance of its first argument');
  }

  let shouldBeNull = await datastore.find(TypeA, { foo: 'bar' });
  if (shouldBeNull !== null) {
    throw new Error(`Datastore should return null when no record matched: but got ${shouldBeNull}`);
  }

  await datastore.delete(TypeA, typeAObjectWithFooField.id);
  shouldBeNull = await datastore.get(TypeA, typeAObjectWithFooField.id);
  if (shouldBeNull !== null) {
    throw new Error('Datastore `deleteById` method should delete the record corresponding to the given id');
  }
}
