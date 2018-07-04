import { gql, Definition, Reducer } from "..";


@Definition.define(gql`
  type Edge {
    """
    A cursor for use in pagination
    """
    cursor: String!
    node: ${def => def.nodeType}
  }
`)
export abstract class Edge<TNode> extends Reducer<TNode> {
  static nodeType: any;
}
