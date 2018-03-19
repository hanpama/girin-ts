import { AbstractDefinition, gql } from 'girin';


@AbstractDefinition(gql`
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
