import { NeDBFrameworkDatastore } from '@girin/framework';
import { environment } from '@girin/environment';

import { AccountsPassword } from '../src';
import { TestUser } from './TestUser';
import { Auth } from '@girin/auth';


describe('model', () => {

  const accounts = new AccountsPassword<TestUser>({});

  environment
    .load(new NeDBFrameworkDatastore())
    .load(new Auth({
      jwtSecretKey: 'FOOBARBAZ',
      userConstructor: TestUser,
    }))
    .load(accounts);

  it('should authenticate', async () => {
    const user = await accounts.createPasswordUser('mytestaccount', 'mystrongpassword');

    // with the right password
    let maybeAuthenticated = await accounts.authenticate(user, 'mystrongpassword');
    expect(maybeAuthenticated).toBeTruthy();

    // with a wrong password
    let maybeNotAuthenticated = await accounts.authenticate(user, 'mywrongpassword');
    expect(maybeNotAuthenticated).toBeFalsy();

    // change password
    await accounts.setPassword(user, 'iamchangingmypassword');

    // with old one
    maybeNotAuthenticated = await accounts.authenticate(user, 'mystrongpassword');
    expect(maybeNotAuthenticated).toBeFalsy();

    // with new one
    maybeAuthenticated = await accounts.authenticate(user, 'iamchangingmypassword');
    expect(maybeAuthenticated).toBeTruthy();
  });
});
