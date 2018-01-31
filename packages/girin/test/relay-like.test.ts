import { graphql } from "graphql/graphql";
import { printSchema } from "graphql/utilities/schemaPrinter";
import { GraphQLSchema } from "graphql/type/schema";

import { Field } from "../src/decorators/Field";
import { Argument } from "../src/decorators/Argument";
import { ObjectType } from "../src/decorators/ObjectType";
import { Implements } from "../src/decorators/Implements";
import { InterfaceType } from "../src/decorators/InterfaceType";
import { getGraphQLType } from "../src/getGraphQLType";


interface NodeSource {
  id: number;
}

interface GroupSource {
  id: number;
  name: string;
}

interface MemberSource {
  id: number;
  name: string;
  email: string;
}

interface MembershipSource {
  memberId: number;
  groupId: number;
  isActive: boolean;
  since: string;
}

const data = {
  group: [
    { id: 1, name: 'Robots' },
    { id: 2, name: 'Humans' },
  ],
  member: [
    { id: 1, name: 'Key', email: 'k@example.com' },
    { id: 2, name: 'Jonghyun', email: 'j@example.com' },
    { id: 3, name: 'Minho', email: 'm@example.com' },
    { id: 4, name: 'Taemin', email: 't@example.com' }
  ],
  membership: [
    { memberId: 1, groupId: 1, isActive: false, since: '2007-03-12' },
    { memberId: 1, groupId: 2, isActive: true, since: '2001-11-09' },
    { memberId: 2, groupId: 1, isActive: true, since: '2006-02-11' },
    { memberId: 2, groupId: 2, isActive: true, since: '2006-12-11' },
    { memberId: 3, groupId: 1, isActive: true, since: '2011-12-31' },
    { memberId: 4, groupId: 1, isActive: true, since: '2011-12-31' },
  ]
}

@InterfaceType()
abstract class Node {
  constructor(protected source: NodeSource) { }
  @Field('ID!', {
    description: 'The id of the object.',
  })
  public id() {
    const uid = `${this.constructor.name}:${this.source.id}`;
    return Buffer.from(uid, 'utf8').toString('base64');
  }
}


@Implements(Node)
@ObjectType()
class Member extends Node {
  constructor(source: MemberSource) {
    super(source);
    this.email = source.email;
    this.name = source.name;
  }


  @Field('String!') name: string;
  @Field('String!') email: string;
}

@ObjectType()
class MemberEdge {
  constructor(private source: MembershipSource) {
    this.isActive = source.isActive;
    this.since = source.since;
  }

  @Field('Boolean!') isActive: boolean;
  @Field('String!') since: string;

  @Field('Member')
  public node() {
    const memberSource = data.member.find(member => member.id === this.source.memberId);
    if (!memberSource) throw new Error('Given member id has no corresponding member source');
    return new Member(memberSource);
  }
}

@ObjectType()
class MemberConnection {
  protected source: MembershipSource[];
  constructor(source: MembershipSource[]) {
    this.source = source;
  }
  @Field('[MemberEdge]!')
  public edges(): MemberEdge[] {
    return this.source.map(source => new MemberEdge(source));
  }
}

@ObjectType()
@Implements(Node)
class Group extends Node {
  constructor(source: GroupSource) {
    super(source);
    this.name = source.name;
  }

  @Field('String!')
  public name: string;

  @Field('MemberConnection!')
  public members() {
    const source = data.membership.filter(membership => membership.groupId === this.source.id);
    return new MemberConnection(source);
  }
}

@ObjectType()
class Query {
  @Field('Group!')
  public group(
    @Argument('id: Int!') id: number,
  ) {
    const groupSource = data.group.find(group => group.id === id);
    if (!groupSource) throw new Error('Group not found');
    return new Group(groupSource);
  }
}

const schema = new GraphQLSchema({
  query: getGraphQLType(Query),
});


describe('relay-like implementation', () => {
  it('generates schema as expected', () => {
    expect(printSchema(schema)).toMatchSnapshot();
  });

  it('should return expected results when queried', async () => {
    const result = await graphql(schema, `
      fragment GroupFragment on Group {
        id
        name
        members {
          edges {
            isActive
            since
            node {
              id
              name
              email
            }
          }
        }
      }
      query {
        robotsMember: group(id: 1) {
          ...GroupFragment
        }
        humansMember: group(id: 2) {
          ...GroupFragment
        }
        nonFound: group(id: 3) {
          ...GroupFragment
        }
      }
    `);

    expect(JSON.stringify(result, null, '  ')).toMatchSnapshot();
  })
});
