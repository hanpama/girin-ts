import { testAuthClient } from './auth-client';


export function testAuth() {
  return Promise.all([
    testAuthClient(),
  ]);
}
