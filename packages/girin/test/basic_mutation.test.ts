import { graphql, GraphQLSchema, printSchema } from 'graphql';

import { Field } from '../src/decorators/Field';
import { Argument } from '../src/decorators/Argument';
import { ObjectType } from '../src/decorators/ObjectType';
import { getGraphQLType } from '../src/getGraphQLType';

interface MemberSource {
  id: number;
  name: string;
  email: string;
}

@ObjectType()
class Member {
  constructor(source: MemberSource) {
    this.id = source.id;
    this.name = source.name;
    this.email = source.email;
  }
  @Field('Int!') id: number;
  @Field('String!') name: string;
  @Field('String!') email: string;
}

@ObjectType()
class Query {
  @Field('Member!')
  public getMember() {
    return new Member({ id: 1, name: 'Jonghyun', email: 'j@example.com' });
  }
}

@ObjectType()
class Mutation {
  @Field('Member!')
  public createMember(
    @Argument("name: String!") name: string,
    @Argument("email: String!") email: string,
  ) {
    return new Member({ id: 2, name, email });
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
    expect(result.data!.createMember.id).toBe(2);
    expect(result.data!.createMember.name).toBe("Key");
    expect(result.data!.createMember.email).toBe("k@example.com");
  });

});
