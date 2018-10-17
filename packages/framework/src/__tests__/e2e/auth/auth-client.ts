import { defineType, gql } from '@girin/typelink';

import { query } from '../../testenv';


class TestAuthQuery {
  static myUserId(_source: null, _args: null, context: any) {
    return context.user && String(context.user.id);
  }
}

defineType(gql`
  extend type Query {
    myUserId: String
  }
`)(TestAuthQuery);

export function testAuthClient() {

  it('should be null when token is not provided', async () => {
    const { data, errors } = await query(`{ myUserId }`);

    expect(errors).toBeFalsy();
    expect(data).toEqual({ myUserId: null });
  });

  it('should be able to sign up', async () => {
    const { data, errors } = await query(`
      mutation {
        signUp(username: "hi123", password: "mypasswordissoostrong")
      }
    `);
    expect(errors).toBeFalsy();
    expect(data.signUp).toBe(true);

  });

  let token: string;
  it('should be able to sign in with created account', async () => {
    const { data, errors } = await query(`
      mutation {
        signIn(username: "hi123", password: "mypasswordissoostrong")
      }
    `);
    expect(errors).toBeFalsy();
    expect(typeof data.signIn).toBe('string');

    token = data.signIn;
  });

  it('should pass user instance to its resolver context', async () => {
    const { data, errors } = await query(`{ myUserId }`, {
      'Authorization': token,
    });
    expect(errors).toBeFalsy();
    expect(typeof data.myUserId).toBe('string');
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

}
