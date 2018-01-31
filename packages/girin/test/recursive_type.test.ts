import { graphql, GraphQLSchema, printSchema } from 'graphql';

import { ObjectType } from '../src/decorators/ObjectType';
import { Field } from '../src/decorators/Field';
import { Argument } from '../src/decorators/Argument';
import { getGraphQLType } from '../src/getGraphQLType';

interface MemberSource {
  id: number;
  name: string;
  email: string;
  friendId: number;
}

const members: MemberSource[] = [
  { id: 0, name: 'Key', email: 'k@example.com', friendId: 1, },
  { id: 1, name: 'Jonghyun', email: 'j@example.com', friendId: 0 },
]

@ObjectType()
class Member {
  constructor(private source: MemberSource) {
    this.id = source.id;
    this.name = source.name;
    this.email = source.email;
  }

  @Field('Int!') id: number;

  @Field('String!') name: string;

  @Field('String!') email: string;

  @Field('Member') friend() {
    const memberSource = members.find(m => m.id === this.source.friendId);
    if (memberSource) {
      return new Member(memberSource);
    }
    return null;
  }
}

@ObjectType()
class Query {
  @Field('Member')
  public getMember(
    @Argument('id: Int!') id: number,
  ) {
    const source = members.find(m => m.id === id);
    return source ? new Member(source) : null;
  }
}

const schema = new GraphQLSchema({ query: getGraphQLType(Query) });

describe('Schema generation and query of recursive types', async () => {

  it('generates schema as expected', () => {
    expect(printSchema(schema)).toMatchSnapshot();
  });

  it('passes source and args to its resolver', async () => {
    const result = await graphql({ schema, source: `
      query {
        getMember(id: 0) {
          id
          friend {
            id
            friend {
              id
            }
          }
        }
      }
    `});
    expect(result.data!.getMember.id).toBe(0);
    expect(result.data!.getMember.friend.id).toBe(1);
    expect(result.data!.getMember.friend.friend.id).toBe(0);
  });

});
