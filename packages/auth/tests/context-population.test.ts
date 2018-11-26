import { Auth, AuthContext } from '../src';
import { TestUser } from './TestUser';
import { environment } from '@girin/environment';
import { NeDBFrameworkDatastore, TestHttpServer, SchemaBuilder, TestClient } from '@girin/framework';
import { defineType, gql } from '@girin/typelink';


@defineType(gql`
  type Query {
    userIdFromContext: String
  }
`)
class Query {
  static userIdFromContext(source: null, args: {}, context: AuthContext) {
    return context.user && context.user.id;
  }
}

describe('Context population', () => {
  let auth: Auth<TestUser>;
  let client: TestClient;
  let user: TestUser;
  let jwtToken: string;

  beforeAll(async () => {
    auth = new Auth({
      jwtSecretKey: 'foobar',
      userConstructor: TestUser,
    });

    environment
      .load(new SchemaBuilder({ Query }))
      .load(new TestHttpServer())
      .load(new NeDBFrameworkDatastore())
      .load(auth);

    await environment.run();
    client = TestHttpServer.object().getClient();

    user = auth.createUserInstance();
    await auth.saveUser(user);
    jwtToken = await auth.encodeToken(user);
  });

  afterAll(() => environment.destroy());

  it('populate user instance from Authorization header', async () => {
    const { data, errors } = await client.sendQuery({
      query: `{ userIdFromContext }`,
    }, {
      Authorization: jwtToken,
    });
    expect(errors).toBeUndefined();
    expect(data).toEqual({ userIdFromContext: user.id });
  });

  it('assign null to context.user when Authorization header not provided', async () => {

    const { data, errors } = await client.sendQuery({
      query: `{ userIdFromContext }`
    });
    expect(errors).toBeUndefined();
    expect(data).toEqual({ userIdFromContext: null });
  });
});
