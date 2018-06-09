import { gql } from "girin";
import { Node, NodeType, NodeField } from "../src/types/node";
import { ObjectType } from "../../girin/metadata";
import { getGraphQLType } from "../../girin/getGraphQLType";
import { mount } from "../../girin/field";
import { GraphQLSchema, printSchema, execute, graphql } from "graphql";
import { toGlobalId } from "graphql-relay";


@NodeType.define(gql`
  type Member implements Node {
    name: String!
  }
`)
class Member extends Node {
  static fetch(id: string) {
    const member = new Member();
    return member;
  }

  name: string;
}


@ObjectType.define(gql`
  type Query {
    hello: String!
  }
`)
class Query {
  @mount(new NodeField()) node: Node
}


describe('node', () => {

  it('should generate and execute schema as expected', async () => {
    const schema = new GraphQLSchema({
      query: getGraphQLType(Query),
      types: [
        getGraphQLType(Member),
      ]
    });

    console.log(printSchema(schema));

    const results = await graphql({ schema, source: `
      query {
        node(id: "${toGlobalId('Member', '3')}") {
          id
          # name
        }
      }
    ` });

    expect(results).toEqual({});
  })
});
