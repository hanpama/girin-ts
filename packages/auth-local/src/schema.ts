import { gql, defineType } from '@girin/typelink';

import { LocalAuth } from './module';


const authMutationSchema = gql`
  extend type Mutation {
    signIn(username: String!, password: String!): String!
    signUp(username: String!, password: String!): Boolean!
  }
`;

export class LocalAuthMutation {
  public static async signUp(_source: any, args: { username: string, password: string }) {
    const mod = LocalAuth.object();
    await mod.createUser(args.username, args.password);
    return true;
  }

  public static async signIn(_source: any, args: { username: string, password: string }) {
    const { username, password } = args;
    const mod = LocalAuth.object();

    const user = await mod.getUserInstance(username);
    if (!user) {
      throw new Error('Authentication Error');
    }

    const authenticated = await mod.authenticate(user, password);
    if (authenticated) {
      return mod.encodeToken(user);
    }
    throw new Error('Authentication Error');
  }
}

export function loadExtensions() {
  defineType(authMutationSchema)(LocalAuthMutation);
}
