import { defineType, gql } from '@girin/typelink';
import { query } from '../testenv';


class UpAndRunningQuery {
  static hello() { return 'World👋'; }
}

defineType(gql`
  extend type Query {
    hello: String!
  }
`)(UpAndRunningQuery);

export function testUpAndRunning() {
  it('should go up and running', async () => {

    expect(await query(`{ hello }`)).toEqual({ data: { hello: 'World👋' }});
  });
}
