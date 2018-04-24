import { defineAbstractType, gql } from 'girin';


@defineAbstractType(gql`
  type Edge {
    """
    A cursor for use in pagination
    """
    cursor: String!
  }
`)
export abstract class Edge<TNode> {
  public cursor: string;
  public node: TNode;
}
