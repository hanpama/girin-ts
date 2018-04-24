import { graphql, GraphQLSchema, printSchema } from 'graphql';

import { defineType, gql, getGraphQLType } from '../src';


@defineType(gql`
  type Member {
    id: Int!
    username: String!
    email: String!
  }
`)
class Member {
  id: number;
  username: string;
  email: string;
}

@defineType(gql`
  input MemberProfileInput {
    firstName: String!
    lastName: String!
  }
`)
class MemberProfileInput {
  public firstName: string;
  public lastName: string;
}

@defineType(gql`
  input MemberInput {
    username: String!
    email: String!
    profile: MemberProfileInput!
  }
`)
class MemberInput {
  public username: string;
  public email: string;
  public profile: MemberProfileInput;
}

@defineType(gql`
  type Query {
    getMember: Member!
  }
`)
class Query {
  public static getMember(): Member {
    return { id: 1, username: 'Jonghyun', email: 'j@example.com' };
  }
}

@defineType(gql`
  type Mutation {
    instantiateMemberInput(member: MemberInput!): Boolean!
    getEmailFromInput(member: MemberInput!): String!
    getUsernameFromInput(member: MemberInput!): String!
  }
`)
class Mutation {
  public static instantiateMemberInput(source: null, { member }: { member: MemberInput }) {
    const result = member instanceof MemberInput && member.profile instanceof MemberProfileInput;
    return result;
  }
  public static getEmailFromInput(source: null, { member }: {member: MemberInput }) {
    return member.email;
  }

  public static getUsernameFromInput(source: null, { member }: { member: MemberInput }) {
    return member.username;
  }
}

const schema = new GraphQLSchema({
  query: getGraphQLType(Query),
  mutation: getGraphQLType(Mutation),
});


describe('Input object instantiation', () => {
  it('generates schema as expected', () => {
    expect(printSchema(schema)).toMatchSnapshot();
  });

  it('should create InputObjectType instance with given argument value', async () => {
    const result = await graphql({ schema, source: `
      mutation {
        instantiateMemberInput(member: {
          username: "key",
          email: "k@example.com",
          profile: { firstName: "Kibum", lastName: "Kim" }
        })
        getUsernameFromInput(member: {
          username: "Key",
          email: "k@example.com",
          profile: { firstName: "Kibum", lastName: "Kim" }
        })
        getEmailFromInput(member: {
          username: "Key",
          email: "k@example.com",
          profile: { firstName: "Kibum", lastName: "Kim" }
        })
      }
    `});
    expect(result).toEqual({ data: {
      getUsernameFromInput: "Key",
      getEmailFromInput: "k@example.com",
      instantiateMemberInput: true,
    }})
  });
});
