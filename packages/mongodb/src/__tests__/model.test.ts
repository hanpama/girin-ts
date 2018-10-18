import { ObjectID } from 'mongodb';

import { Model, field, one, many } from '..';
import { prepareTestEnv, cleanUpTestEnv } from './testenv';


describe('model', () => {
  class User extends Model {
    static collectionName = 'model-test';

    @field('_id') primaryKey: string;
    @field() displayName: string;

    @one(User) toOneReference: User;
    @many(User) toManyReferece: User[];
  }

  beforeAll(prepareTestEnv);
  afterAll(async () => {
    await User.getManager().db.dropCollection(User.collectionName);
    await cleanUpTestEnv();
  });

  let savedUser: User;
  let fetchedUser: User;

  it('should be created', async () => {
    // create and save model instance
    savedUser = new User({ displayName: 'Foobar' });
    await savedUser.$save();
    expect(savedUser._id).not.toBeUndefined();
  });

  it('should pull the document', async () => {
    // create and pull model instance
    fetchedUser = new User();
    fetchedUser._id = savedUser._id;
    await fetchedUser.$pull();
    const displayName = fetchedUser.displayName;
    expect(displayName).toBe('Foobar');
  });

  it('should be updated by assining field values', async () => {
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

  it('should should return null when there is no document matched', async () => {

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
  });

  let insertedUser: User;
  it('should be able to created by inserting a document', async () => {
    insertedUser = await User.insertOne({ displayName: 'Baz' });
    expect(insertedUser.displayName).toBe('Baz');
    expect(insertedUser._id).toHaveLength(24); // ObjectID
    expect(insertedUser).toBeInstanceOf(User);
  });

  it('should be deleted by $delete method', async () => {
    const id = await insertedUser.$delete();
    expect(id).toBe(insertedUser._id);
    const maybeNull = await User.getOne(insertedUser._id!);
    expect(maybeNull).toBeNull();
  });

  it('should be able to assign a model instance to @one reference', () => {
    const user1 = new User();
    const user2 = new User({ _id: new ObjectID() });
    user1.toOneReference = user2;

    expect(user1.toOneReference._id).toBe(user2._id);
  });

  it('should prevent to assign a model instance without _id to @one', () => {
    const user1 = new User();
    const user2 = new User();

    expect(() => user1.toOneReference = user2).toThrow(
      'Cannot assign to @one field because the target model instance has no _id',
    );
  });

  it('should be able to assign other model instances to @many refrence', () => {
    const user1 = new User();
    const user2 = new User({ _id: new ObjectID() });
    const user3 = new User({ _id: new ObjectID() });

    user1.toManyReferece = [user2, user3];
    expect(user1.toManyReferece.map(user => user._id)).toEqual([user2._id, user3._id]);
  });

  it('should prevent to assign model instances any of which has no _id', () => {
    const user1 = new User();
    const user2 = new User({ _id: new ObjectID() });
    const user3 = new User();

    expect(() => user1.toManyReferece = [user2, user3]).toThrow(
      'Cannot assign to @one field because the target model instance has no _id',
    );
  });
});
