import { ObjectID } from "mongodb";

import { Model, field } from "..";
import { prepareTestEnv, cleanUpTestEnv } from "./testenv";


describe('model', () => {
  class User extends Model {
    static collectionName = 'model-test';

    @field('_id') primaryKey: string;
    @field() displayName: string;
  }

  beforeAll(prepareTestEnv);
  afterAll(async () => {
    await User.getManager().db.dropCollection(User.collectionName);
    await cleanUpTestEnv();
  });


  it('should be create, update, and pull document', async () => {
    // create and save model instance
    const savedUser = new User({ displayName: 'Foobar' });
    await savedUser.$save();
    expect(savedUser._id).not.toBeUndefined();

    // create and pull model instance
    const fetchedUser = new User();
    fetchedUser._id = savedUser._id;
    await fetchedUser.$pull();
    const displayName = fetchedUser.displayName;
    expect(displayName).toBe('Foobar');

    // make a new revision
    fetchedUser.displayName = 'Manoha';
    await fetchedUser.$save();

    // pull the new revision
    await savedUser.$pull();
    expect(savedUser.displayName).toBe('Manoha');

    // directly update
    await savedUser.$update({ $set: { displayName: 'New Manoha' } });
    await savedUser.$pull();
    expect(savedUser.displayName).toBe('New Manoha');

    // not found resut to be null
    const generatedId1 = new ObjectID();
    const generatedId2 = new ObjectID();
    expect(await User.getOne(generatedId1)).toBe(null);
    const manyDocs = await User.getMany([
      generatedId1,
      savedUser._id!,
      generatedId2,
    ]);
    expect(manyDocs.map(i => i && i._id)).toEqual([null, savedUser._id, null]);

    // insert a document with source
    const insertedUser = await User.insert({ displayName: 'Baz' });
    expect(insertedUser.displayName).toBe('Baz');
    expect(insertedUser._id).toHaveLength(24); // ObjectID
    expect(insertedUser).toBeInstanceOf(User);

    // delete
    const id = await insertedUser.$delete();
    expect(id).toBe(insertedUser._id);
    const maybeNull = await User.getOne(insertedUser._id!);
    expect(maybeNull).toBeNull();
  });
});
