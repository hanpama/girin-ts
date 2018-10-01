import { cleanUpTestEnv, prepareTestEnv } from "./testenv";
import { BaseUser } from "..";
import { typedef, gql } from "@girin/typelink";
import { field } from "../../mongodb";


@typedef(gql`
  type Query {
    hello: String!
  }
`)
class Query {
  static hello() { return 'world'; }
}

describe('BaseUser', () => {
  class User extends BaseUser {
    static collectionName = 'base-user-test';

    @field() public username: string;
  }

  beforeAll(async () => {
    await prepareTestEnv(Query);
  });
  afterAll(async () => {
    await User.getManager().db.dropCollection(User.collectionName);
    await cleanUpTestEnv();
  });

  it('should authenticate and work with jwt', async () => {
    const user = await User.createUserWithPassword({ username: 'user' }, 'mystrongpassword');

    // with the right password
    let maybeAuthenticated = await user.authenticate('mystrongpassword');
    expect(maybeAuthenticated).toBeTruthy();

    // with a wrong password
    let maybeNotAuthenticated = await user.authenticate('mywrongpassword');
    expect(maybeNotAuthenticated).toBeFalsy();

    // creating token
    const token = await user.encodeToken('mystrongpassword');
    const userFromToken = await User.decodeToken(token);

    expect(userFromToken._id.equals(user._id)).toBeTruthy();

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
