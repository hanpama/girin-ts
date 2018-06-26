import { GraphQLObjectType, GraphQLList } from "graphql";

import { Connection, Edge } from "../src/connection";
import { ObjectType , getGraphQLType, gql } from "../src";


describe('Connection', () => {
  it('should be created with nodeType as expected', () => {

    @ObjectType.define(gql`
      type Foo {
        bar: String
      }
    `)
    class Foo {}

    @ObjectType.define()
    class FooConnection extends Connection<any> {
      static nodeType = Foo
    }

    const fooType: GraphQLObjectType = getGraphQLType(Foo);
    const fooConnectionType: GraphQLObjectType = getGraphQLType(FooConnection);
    const connectionFields = fooConnectionType.getFields();

    expect(connectionFields.edges.type).toBeInstanceOf(GraphQLList);

    const edgeType = (connectionFields.edges.type as GraphQLList<any>).ofType;
    expect(edgeType.name).toBe("FooConnectionEdge");

    const nodeType = edgeType.getFields().node.type;
    expect(nodeType).toBe(fooType);
  });

  it('should be created with edgeType as expected', () => {

    @ObjectType.define(gql`
      type Bar {
        baz: String
      }
    `)
    class Bar {}

    @ObjectType.define()
    class BarEdge extends Edge<Bar> {
      static nodeType = Bar;
    }

    @ObjectType.define()
    class BarConnection extends Connection<any> {
      static edgeType = BarEdge;
    }

    const barType: GraphQLObjectType = getGraphQLType(Bar);
    const barConnectionType: GraphQLObjectType = getGraphQLType(BarConnection);

    const connectionFields = barConnectionType.getFields();

    expect(connectionFields.edges.type).toBeInstanceOf(GraphQLList);
    const edgeType = (connectionFields.edges.type as GraphQLList<any>).ofType;
    expect(edgeType.name).toBe("BarEdge");

    const nodeType = edgeType.getFields().node.type;
    expect(nodeType).toBe(barType);
  });
});
