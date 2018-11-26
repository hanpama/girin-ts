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
  // inserting
  const typeAObject = new TypeA();
  typeAObject.foo = 'foo';
  const typeBObject = new TypeB();
  typeBObject.bar = 'bar';

  let savedTypeAObject = await datastore.save(typeAObject);
  let savedTypeBObject = await datastore.save(typeBObject);

  if (savedTypeAObject instanceof TypeA && savedTypeBObject instanceof TypeB) {} else {
    throw new Error('Object returned by `save()` method should have same type of its first argument');
  }
  if (savedTypeAObject.id && savedTypeBObject.id) {} else {
    console.log(savedTypeAObject, savedTypeBObject);
    throw new Error('Saved record should have `id` property');
  }

  // getting by id
  let fetchedTypeAObject = await datastore.get(TypeA, savedTypeAObject.id);
  let fetchedTypeBObject = await datastore.get(TypeB, savedTypeBObject.id);

  if (fetchedTypeAObject instanceof TypeA && fetchedTypeBObject instanceof TypeB) {} else {
    throw new Error('Object returned by `getById()` method should be an instance of its first argument');
  }

  // finding by predicate
  const typeAObjectWithFooField = await datastore.find(TypeA, { foo: 'foo' });
  if (typeAObjectWithFooField && typeAObjectWithFooField.foo === 'foo') {} else {
    throw new Error('Datastore should retrieve saved value by get query');
  }

  if (typeAObjectWithFooField instanceof TypeA) {} else {
    throw new Error('Object returned by `get()` method should be an instance of its first argument');
  }

  // update
  typeAObject.foo = 'foo2';
  const updatedTypeAObject = await datastore.save(typeAObject);

  if (updatedTypeAObject.foo === 'foo2') {} else {
    throw new Error(`Saved object should haved updated value "foo2" but got "${updatedTypeAObject.foo}"`);
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
