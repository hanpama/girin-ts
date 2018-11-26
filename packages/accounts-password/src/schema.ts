import { gql, defineType } from '@girin/typelink';

import { AccountsPassword } from './module';


const authMutationSchema = gql`
  extend type Mutation {
    signIn(username: String!, password: String!): String!
    signUp(username: String!, password: String!): String!
  }
`;

export class LocalAuthMutation {
  public static signUp(_source: any, args: { username: string, password: string }): Promise<string> {
    return AccountsPassword.object().signUp(args.username, args.password);
  }

  public static async signIn(_source: any, args: { username: string, password: string }): Promise<string> {
    return AccountsPassword.object().signIn(args.username, args.password);
  }
}

export function loadExtensions() {
  defineType(authMutationSchema)(LocalAuthMutation);
}
