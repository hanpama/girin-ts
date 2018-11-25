import { defineType, gql } from '@girin/typelink';
import { prepareTestEnv, destroyTestEnv, TestHttpServer, TestClient } from '@girin/framework';

import AuthLocalModule, { User, AuthContext } from '../src';
import { TestUser } from './TestUser';


@defineType(gql`
  type Query {
    testGetUserIdFromContext: String
  }
`)
export class Query {
  static testGetUserIdFromContext(_source: null, _args: null, context: any) {
    return context.user && String(context.user.id);
  }
}

@defineType(gql`
  type Mutation {
    testChangePassword(password: String!): Boolean!
  }
`)
export class Mutation {
  static async testChangePassword(_source: null, args: { password: string }, context: AuthContext<User>) {
    const user = context.user;
    const authModule = AuthLocalModule.object();

    await authModule.setPassword(user, args.password);
    return true;
  }
}

describe('client auth', () => {
  let client: TestClient;
  beforeAll(async () => {
    await prepareTestEnv({ Query, Mutation })
      .load(new AuthLocalModule({
        jwtSecretKey: 'FOOBARBAZ',
        userConstructor: TestUser,
      }))
      .run();
    client = TestHttpServer.object().getClient();
  });
  afterAll(destroyTestEnv);


  it('should be null when token is not provided', async () => {
    const { data, errors } = await client.sendQuery({ query: `{ testGetUserIdFromContext }` });

    expect(errors).toBeFalsy();
    expect(data).toEqual({ testGetUserIdFromContext: null });
  });

  it('should be able to sign up', async () => {
    const { data, errors } = await client.sendQuery({ query: `
      mutation {
        signUp(username: "hi123", password: "mypasswordissoostrong")
      }
    `});
    expect(errors).toBeFalsy();
    expect(data.signUp).toBe(true);

  });

  let token: string;
  it('should be able to sign in with created account', async () => {
    const { data, errors } = await client.sendQuery({ query: `
      mutation {
        signIn(username: "hi123", password: "mypasswordissoostrong")
      }
    `});
    expect(errors).toBeFalsy();
    expect(typeof data.signIn).toBe('string');

    token = data.signIn;
  });

  it('should pass user instance to its resolver context', async () => {
    const { data, errors } = await client.sendQuery({ query: `{ testGetUserIdFromContext }` }, {
      'Authorization': token,
    });
    expect(errors).toBeFalsy();
    expect(typeof data.testGetUserIdFromContext).toBe('string');
  });

  // it('should not allow duplicate username', async () => {
  //   const res = await fetch(url, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       query: `mutation {
  //         signUp(username: "hi123", password: "mypasswordissoostrong")
  //       }` }),
  //   });
  // })

  // password is too short
  // password is too common
});
