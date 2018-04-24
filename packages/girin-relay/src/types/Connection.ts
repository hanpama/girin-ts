import { gql, defineAbstractType } from "girin";

import { PageInfo } from './PageInfo';


@defineAbstractType(gql`
  type Connection {
    """
    Information to aid in pagination.
    """
    pageInfo: ${PageInfo}
  }
`)
export abstract class Connection<TEdge> {
  public pageInfo: PageInfo;
  public edges: TEdge[];
}
