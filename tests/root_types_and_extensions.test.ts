import { GraphQLSchema, printSchema, graphql } from 'graphql';
import { defineType, gql, Mutation, Query, getType } from '../src';


@defineType(gql`
  type User {
    id: Int!
    username: String!
  }
  input UserInput {
    username: String!
  }

  extend type Query {
    getUser(userId: Int!): User!
    userClassName: String!
  }
  extend type Mutation {
    createUser(user: UserInput!): User!
  }
`)
class User {
  id: number;
  username: string;

  // extend type Query
  static getUser(_source: null, { userId }: { userId: number }) {
    const user = new User();
    user.id = userId;
    user.username = `User${userId}`;
    return user;
  }

  static userClassName() {
    return this.name;
  }

  // extend type Mutation
  static createUser(_source: null, { user }: { user: User }) {
    return user;
  }
}

const schema = new GraphQLSchema({
  query: getType(Query),
  mutation: getType(Mutation),
  types: [getType(User)],
});


describe('Root types and extensions', () => {
  it('should generate schema as expected', () => {
    expect(printSchema(schema)).toMatchSnapshot();
  });

  it('has resolvers binded to their definition class', async () => {
    const res = await graphql({ schema, source: `
      query {
        getUser(userId: 12) {
          id
          username
        }
        userClassName
      }
    `});
    expect(res).toEqual({
      data: {
        getUser: {
          id: 12,
          username: 'User12',
        },
        userClassName: 'User',
      },
    });
  });
});
