import { Auth } from '../src';
import { TestUser } from './TestUser';
import { environment } from '@girin/environment';
import { NeDBFrameworkDatastore } from '@girin/framework';


describe('JWT Authentication', () => {
  const auth = new Auth({
    jwtSecretKey: 'foobar',
    userConstructor: TestUser,
  });

  environment
    .load(new NeDBFrameworkDatastore())
    .load(auth);

  beforeAll(() => environment.run());

  it('creates token from user and decode it into user', async () => {

    const user = auth.createUserInstance();
    await auth.saveUser(user);

    const jwtToken = await auth.encodeToken(user);
    expect(typeof jwtToken).toBe('string');

    const userFromToken = await auth.decodeToken(jwtToken);

    expect(user.id).toBe(userFromToken.id);
  });
});
