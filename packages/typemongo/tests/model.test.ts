import 'reflect-metadata';

import { ObjectID } from 'mongodb';

import { Model, field } from '../src';
import { prepareTestEnv, cleanUpTestEnv } from './testenv';


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

  let savedUser: User;
  let fetchedUser: User;

  it('should be created with source', async () => {
    // create and save model instance
    savedUser = new User({ displayName: 'Foobar' });
    await savedUser.$save();
    expect(savedUser._id).not.toBeUndefined();
  });

  it('should pull the document matched with its id', async () => {
    // create and pull model instance
    fetchedUser = new User();
    fetchedUser._id = savedUser._id;
    await fetchedUser.$pull();
    const displayName = fetchedUser.displayName;
    expect(displayName).toBe('Foobar');
  });

  it('should be updated by assigning field values', async () => {
    // make a new revision
    fetchedUser.displayName = 'Manoha';
    await fetchedUser.$save();

    // pull the new revision
    await savedUser.$pull();
    expect(savedUser.displayName).toBe('Manoha');
  });

  it('should be directly updated with $update method', async () => {

    // directly update
    await savedUser.$update({ $set: { displayName: 'New Manoha' } });
    await savedUser.$pull();
    expect(savedUser.displayName).toBe('New Manoha');
  });

  it('should return null when there is no document matched', async () => {

    // not found resut to be null
    const generatedId1 = new ObjectID();
    const generatedId2 = new ObjectID();
    expect(await User.getOne(generatedId1)).toBe(null);
    const manyDocs = await User.getMany([
      generatedId1,
      savedUser._id,
      generatedId2,
    ]);
    expect(manyDocs.map(i => i && i._id)).toEqual([null, savedUser._id, null]);
  });

  let insertedUser: User;
  it('is created by inserting a document', async () => {
    insertedUser = await User.insertOne({ displayName: 'Baz' });
    expect(insertedUser.displayName).toBe('Baz');
    expect(insertedUser._id).toBeInstanceOf(ObjectID); // ObjectID
    expect(insertedUser).toBeInstanceOf(User);
  });

  it('is deleted by $delete method', async () => {
    const id = await insertedUser.$delete();
    expect(id).toBe(insertedUser._id.toHexString());
    const maybeNull = await User.getOne(insertedUser._id);
    expect(maybeNull).toBeNull();
  });
});
