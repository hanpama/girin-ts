import { gql, ObjectType, Component, source } from "..";


export interface PageInfoSource {
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  startCursor?: string;
  endCursor?: string;
}

@ObjectType.define(gql`
  """
  Information about pagination in a connection.
  """
  type PageInfo {
    """When paginating forwards, are there more items?"""
    hasNextPage: Boolean!

    """When paginating backwards, are there more items?"""
    hasPreviousPage: Boolean!

    """When paginating backwards, the cursor to continue."""
    startCursor: String

    """When paginating forwards, the cursor to continue."""
    endCursor: String
  }
`)
export class PageInfo extends Component<PageInfoSource> {
  @source() hasNextPage: boolean;
  @source() hasPreviousPage: boolean;
  @source() startCursor?: string | null;
  @source() endCursor?: string | null;
}
