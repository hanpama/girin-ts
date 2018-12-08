import { defineType, gql } from '..';


@defineType(() => gql`
  """
  An object with an ID
  """
  interface Node {
    """
    The id of the object.
    """
    id: ID!
  }
`)
export abstract class Node {}
