import { typedef, gql,  } from '@girin/typelink';
import { BaseUser } from '@girin/girin/dist/auth-local'
import { ObjectIDType, field } from '@girin/girin/dist/mongodb';


@typedef(gql`
  type User {
    id: ${ObjectIDType}
    username: String!
  }
  input UserInput {
    username: String!
  }
  extend type Query {
    token(username: String!, password: String!): String!
  }
  extend type Mutation {
    createUser(user: ${User}!, password: String!): ${User}!
  }
`)
export class User extends BaseUser {
  static collectionName = 'users';
  static get SECRET_KEY() { return 'FOOBARBAZ' }; // TODO: move this to configs

  static async createUser(_source: null, { user, password }: { user: User, password: string }) {
    return this.createUserWithPassword((user as any).$source, password);
  }

  static async token(_source: null, { username, password }: { username: string, password: string }) {
    const user: User = await this.findOne({ username });
    if (!user) { throw new Error('Authentication Error'); }
    return user.encodeToken(password);
  }

  @field()
  username: string;
}
