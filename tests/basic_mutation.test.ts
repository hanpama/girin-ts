import { graphql, GraphQLSchema, printSchema } from 'graphql';

import { getType, gql, defineType } from '../src';


@defineType(gql`
  type Member {
    id: Int!
    name: String!
    email: String!
  }
`)
class Member {
  constructor(
    public id: number,
    public name: string,
    public email: string,
  ) { }
}

@defineType(gql`
  type Query {
    getMember: ${Member}! @resolver
  }
`)
class Query {
  public static getMember() {
    return new Member(1, 'Jonghyun', 'j@example.com');
  }
}

@defineType(gql`
  type Mutation {
    createMember(name: String!, email: String!): ${Member}!
  }
`)
class Mutation {
  public static createMember(_source: null, { name, email }: { name: string, email: string }) {
    return new Member(2, name, email);
  }
}

const schema = new GraphQLSchema({
  query: getType(Query),
  mutation: getType(Mutation),
});


describe('Basic mutation and schema generation', async () => {

  it('generates schema as expected', () => {
    expect(printSchema(schema)).toMatchSnapshot();
  });

  it('passes source and args to its resolver', async () => {
    const result = await graphql({ schema, source: `
      mutation {
        createMember(name: "Key" email: "k@example.com") {
          id
          name
          email
        }
      }
    `});
    expect(result).toEqual({ data: {
      createMember: { id: 2, name: 'Key', email: 'k@example.com' }
    }});
  });
});
