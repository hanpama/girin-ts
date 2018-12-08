import { defineType } from '../global';
import { gql } from '../sdl/gql';


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
