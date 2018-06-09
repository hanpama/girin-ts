import { gql, defineAbstractType } from "girin";

import { PageInfo } from './PageInfo';
import { ConnectionArguments } from "graphql-relay";


@defineAbstractType(gql`
  type Connection {
    """
    Information to aid in pagination.
    """
    pageInfo: ${PageInfo}
  }
`)
export abstract class Connection<TEdge, TSource, TArgs extends ConnectionArguments = ConnectionArguments> {
  constructor(
    protected source: TSource,
    protected args: TArgs
  ) { }

  public abstract pageInfo: PageInfo;
  public abstract edges: TEdge[];
}
