import { typedef, gql, Query, Mutation } from "@girin/typelink";
import { fetch } from "apollo-server-env";

import { cleanUpTestEnv, prepareTestEnv } from "./testenv";
import { BaseUser } from "..";
import { AuthLocalContext } from "../module";
import { ObjectIDType } from "../../mongodb";


@typedef(gql`
  type User {
    id: ${ObjectIDType}!
    username: String
  }
  input UserInput {
    username: String
  }

  extend type Query {
    token(username: String!, password: String!): String!
    me: ${User}
  }
  extend type Mutation {
    createUser(user: ${User}!, password: String!): ${User}!
  }
`)
class User extends BaseUser {
  static collectionName = 'usermodeltest';

  static async createUser(_source: null, { user, password }: { user: User, password: string }) {
    return this.createUserWithPassword((user as any).$source, password);
  }

  static async token(_source: null, { username, password }: { username: string, password: string }) {
    const user: User = await this.findOne({ username });
    if (!user) { throw new Error('Authentication Error: invalid user'); }
    return user.encodeToken(password);
  }
  static me(_source: null, _args: null, context: AuthLocalContext) {
    return context.user;
  }
}

describe('Auth context', () => {
  beforeAll(async () => {
    await prepareTestEnv(User, Query, Mutation);
  });
  afterAll(async () => {
    await User.getManager().db.dropCollection(User.collectionName);
    await cleanUpTestEnv();
  });

  const serverURL = 'http://localhost:11111';

  it('should be null when token is not provided', async () => {

    let res = await fetch(serverURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `{
        me {
          id
          username
        }
      }` }),
    });

    expect(await res.json()).toEqual({ data: { me: null } });
  });
  it('should have user object in context when token is provided', async () => {

    let res = await fetch(serverURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `mutation {
          createUser(user: { username: "hi123" }, password: "password") {
            id
            username
          }
        }` }),
    });

    var { data, errors } = await res.json();

    expect(errors).toBeFalsy();
    expect(data.createUser.username).toBe('hi123');
    expect(data.createUser.id).toHaveLength(24); // ObjectID

    const userId: string = data.createUser.id;

    res = await fetch(serverURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `{ token(username: "hi123", password: "password") }` }),
    });
    var { data, errors } = await res.json();

    expect(errors).toBeFalsy();
    expect(typeof data.token).toBe('string');

    res = await fetch(serverURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': data.token,
      },
      body: JSON.stringify({ query: `{ me { id username } }` }),
    });

    expect(await res.json()).toEqual({
      data: { me: { id: userId, username: 'hi123' } },
    });
  });
});
