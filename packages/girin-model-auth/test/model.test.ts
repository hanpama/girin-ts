import { MongoClient } from "mongodb";

import { prepareTestClient } from "./testenv";
import { BaseUser } from "../src";


describe('BaseUser', () => {
  class User extends BaseUser {
    static collectionName = 'base-user-test';

    static get SECRET_KEY() {
      return '59C253E1F53135E5'
    }
  }

  let client: MongoClient;
  beforeEach(async () => {
    client = await prepareTestClient();
  });
  afterEach(async () => {
    await User.getContext().db.dropDatabase();
    await client.close(true);
  });

  it('should authenticate and work with jwt', async () => {
    const user = await User.createUser({  _id: 'user' }, 'mystrongpassword');

    // with the right password
    let maybeAuthenticated = await user.authenticate('mystrongpassword');
    expect(maybeAuthenticated).toBeTruthy();

    // with a wrong password
    let maybeNotAuthenticated = await user.authenticate('myweakpassword');
    expect(maybeNotAuthenticated).toBeFalsy();

    // creating token
    const token = await user.encodeToken('mystrongpassword');
    const userFromToken = await User.decodeToken(token);

    expect(userFromToken._id).toBe('user');

    // change password
    await user.changePassword('iamchangingmypassword');

    // with old one
    maybeNotAuthenticated = await user.authenticate('mystrongpassword')
    expect(maybeNotAuthenticated).toBeFalsy();

    // with new one
    maybeAuthenticated = await user.authenticate('iamchangingmypassword');
    expect(maybeAuthenticated).toBeTruthy();
  });
});
