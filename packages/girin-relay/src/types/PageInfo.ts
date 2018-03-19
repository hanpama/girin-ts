import { Definition, gql } from 'girin';


@Definition(gql`
  """
  Information about pagination in a connection.
  """
  type PageInfo {
    """
    When paginating forwards, are there more items?
    """
    hasNextPage: Boolean!

    """
    When paginating backwards, are there more items?
    """
    hasPreviousPage: Boolean!

    """
    When paginating backwards, the cursor to continue.
    """
    startCursor: String

    """
    When paginating forwards, the cursor to continue.
    """
    endCursor: String
  }
`)
export class PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}
