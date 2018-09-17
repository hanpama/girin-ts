export interface ConnectionArgs {
  after?: string;
  before?: string;
  first?: number;
  last?: number;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ConnnectionSource {
  rows: any[];
  totalRows: number;
  offset: number;
}

export interface Edge<TNode> {
  node: TNode;
  cursor: string;
}

export interface Connection<TNode> {
  edges: Array<Edge<TNode>>;
  pageInfo: PageInfo;
  offset?: number;
  rest?: number;
  total?: number;
}
