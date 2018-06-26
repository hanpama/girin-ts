import { graphql, GraphQLSchema, printSchema } from 'graphql';

import { gql, getGraphQLType } from '../src';
import { ObjectType } from '../src/metadata/ObjectType';


@ObjectType.define(gql`
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
  ){ }
}

@ObjectType.define(gql`
  type Query {
    getMember: ${Member}! @resolver
  }
`)
class Query {
  public static getMember() {
    return new Member(1, 'Jonghyun', 'j@example.com');
  }
}

@ObjectType.define(gql`
  type Mutation {
    createMember(name: String!, email: String!): ${Member}!
  }
`)
class Mutation {
  public static createMember(source: null, { name, email }: { name: string, email: string }) {
    return new Member(2, name, email);
  }
}

const schema = new GraphQLSchema({
  query: getGraphQLType(Query),
  mutation: getGraphQLType(Mutation),
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
