import { gql, Definition, Component } from "..";


@Definition.define(gql`
  type Edge {
    """
    A cursor for use in pagination
    """
    cursor: String!
    node: ${def => def.nodeType}
  }
`)
export abstract class Edge<TNode> extends Component<TNode> {
  static nodeType: any;
}
