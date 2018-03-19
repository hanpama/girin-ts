import { gql, AbstractDefinition } from "girin";

import { PageInfo } from './PageInfo';


@AbstractDefinition(gql`
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
