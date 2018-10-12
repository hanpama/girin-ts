import { prepareTestEnv } from "./testenv";
import { User, AuthLocalModule } from "..";


const testUserStorage: User[] = [];

class TestAuthModule extends AuthLocalModule<User> {
  async bootstrap() {}
  async deserializeUserInstance(ser: { id: number }) {
    const user = testUserStorage.find(user => user.id === ser.id);
    if (!user) { throw new Error('Authentication Error'); }
    return user;
  }
  serializeUserInstance(user: User) {
    return { id: user.id };
  }
}

function saveUser(user: User) {
  testUserStorage.push(user);
}

describe('AuthModule', () => {
  beforeAll(() => {
    prepareTestEnv().load(new TestAuthModule({
      JWT_SECRET_KEY: '12345',
      USER: User,
    }));
  });

  it('should authenticate and work with jwt', async () => {
    const userModule = TestAuthModule.object();
    const user = await userModule.createUserInstance('mystrongpassword');

    user.username = 'mytestaccount';

    // save user to database
    saveUser(user);

    // with the right password
    let maybeAuthenticated = await userModule.authenticate(user, 'mystrongpassword');
    expect(maybeAuthenticated).toBeTruthy();

    // with a wrong password
    let maybeNotAuthenticated = await userModule.authenticate(user, 'mywrongpassword');
    expect(maybeNotAuthenticated).toBeFalsy();

    // creating token
    const token = await userModule.encodeToken(user);
    const userFromToken = await userModule.decodeToken(token);

    expect(userFromToken.id).toEqual(user.id);

    // change password
    await userModule.setPassword(user, 'iamchangingmypassword');

    // with old one
    maybeNotAuthenticated = await userModule.authenticate(user, 'mystrongpassword')
    expect(maybeNotAuthenticated).toBeFalsy();

    // with new one
    maybeAuthenticated = await userModule.authenticate(user, 'iamchangingmypassword');
    expect(maybeAuthenticated).toBeTruthy();
  });
});
