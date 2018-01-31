import { graphql, GraphQLSchema, printSchema } from 'graphql';

import { Field } from '../src/decorators/Field';
import { Argument } from '../src/decorators/Argument';
import { InputField } from '../src/decorators/InputField';
import { ObjectType } from '../src/decorators/ObjectType';
import { InputObjectType } from '../src/decorators/InputObjectType';
import { getGraphQLType } from '../src/getGraphQLType';


interface MemberSource {
  id: number;
  username: string;
  email: string;
}

@ObjectType()
class Member {
  constructor(source: MemberSource) {
    this.id = source.id;
    this.username = source.username;
    this.email = source.email;
  }
  @Field('Int!') id: number;
  @Field('String!') username: string;
  @Field('String!') email: string;
}

@InputObjectType()
class MemberProfileInput {
  constructor(
    @InputField("firstName: String!")
    public firstName: string,
    @InputField("lastName: String!")
    public lastName: string,
  ) { }
}

@InputObjectType()
class MemberInput {
  constructor(
    @InputField("username: String!")
    public username: string,
    @InputField("email: String!")
    public email: string,
    @InputField('profile: MemberProfileInput!')
    public profile: MemberProfileInput,
  ) { }
}

@ObjectType()
class Query {
  @Field('Member!')
  public getMember() {
    return new Member({ id: 1, username: 'Jonghyun', email: 'j@example.com' });
  }
}

@ObjectType()
class Mutation {
  @Field('Boolean!')
  public instantiateMemberInput(
    @Argument("member: MemberInput!") member: MemberInput,
  ) {
    return member instanceof MemberInput && member.profile instanceof MemberProfileInput;
  }

  @Field('String!')
  public getEmailFromInput(
    @Argument("member: MemberInput!") member: MemberInput,
  ) {
    return member.email;
  }

  @Field('String!')
  public getUsernameFromInput(
    @Argument("member: MemberInput!") member: MemberInput,
  ) {
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
    // console.log(JSON.stringify(result, null, '  '));
    expect(result.data!.getUsernameFromInput).toBe("Key");
    expect(result.data!.getEmailFromInput).toBe("k@example.com");
    expect(result.data!.instantiateMemberInput).toBe(true);
  });
});
