import { NeDBFrameworkDatastore } from '@girin/framework';
import { environment } from '@girin/environment';

import AuthLocal from '../src';
import { TestUser } from './TestUser';


describe('model', () => {

  const userModule = new AuthLocal({
    jwtSecretKey: 'FOOBARBAZ',
    userConstructor: TestUser,
  });
  environment.load(new NeDBFrameworkDatastore()).load(userModule);

  it('should authenticate', async () => {
    const user = await userModule.createUser('mytestaccount', 'mystrongpassword');

    // with the right password
    let maybeAuthenticated = await userModule.authenticate(user, 'mystrongpassword');
    expect(maybeAuthenticated).toBeTruthy();

    // with a wrong password
    let maybeNotAuthenticated = await userModule.authenticate(user, 'mywrongpassword');
    expect(maybeNotAuthenticated).toBeFalsy();

    // creating token
    const token = await userModule.encodeToken(user);
    const userFromToken = await userModule.decodeToken(token);

    expect(userFromToken.username).toEqual(user.username);

    // change password
    await userModule.setPassword(user, 'iamchangingmypassword');

    // with old one
    maybeNotAuthenticated = await userModule.authenticate(user, 'mystrongpassword');
    expect(maybeNotAuthenticated).toBeFalsy();

    // with new one
    maybeAuthenticated = await userModule.authenticate(user, 'iamchangingmypassword');
    expect(maybeAuthenticated).toBeTruthy();
  });
});
