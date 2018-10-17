import { defineType, gql } from '@girin/typelink';


export interface ConnectionArguments {
  first?: number | null;
  last?: number | null;
  after?: string | null;
  before?: string | null;
}

export abstract class Connection<TNode, TResponse = any, TItem = any> {
  constructor(protected args: ConnectionArguments) {
    if (args.first && args.first < 0) {
      throw new Error('Argument "first" must be a non-negative integer');
    }
    if (args.last && args.last < 0) {
      throw new Error('Argument "last" must be a non-negative integer');
    }
  }

  protected _queryPromise: Promise<TResponse> | null = null;
  protected getOrCreateQueryPromise() {
    if (!this._queryPromise) { this._queryPromise = this.query(); }
    return this._queryPromise;
  }

  get edges() {
    return this.getOrCreateQueryPromise().then(res => {
      const items = this.getItems(res);
      const edges: Edge<TNode, TResponse, TItem>[] = [];
      for (let i = 0; i < items.length; i++) {
        edges.push(this.resolveEdge(items[i]));
      }
      return edges;
    });
  }

  get pageInfo() {
    return this.getOrCreateQueryPromise().then(res => {
      return this.resolvePageInfo(res);
    });
  }

  resolveEdge(item: TItem): Edge<TNode, TResponse, TItem> {
    return new Edge(this, item);
  }
  resolvePageInfo(response: TResponse): PageInfo<TNode, TResponse, TItem> {
    return new PageInfo(this, response);
  }

  abstract resolveCursor(item: TItem): string | Promise<string>;
  abstract resolveNode(item: TItem): TNode;
  abstract resolveHasNextPage(reponse: TResponse): boolean | Promise<boolean>;
  abstract resolveHasPreviousPage(reponse: TResponse): boolean | Promise<boolean>;
  abstract getItems(response: TResponse): ArrayLike<TItem>;
  abstract query(): Promise<TResponse>;
}

@defineType(gql`
  type PageInfo {
    hasNextPage: Boolean
    hasPreviousPage: Boolean
    startCursor: String
    endCursor: String
  }
`)
export class PageInfo<TNode, TResponse = any, TItem = any> {
  constructor(
    protected connection: Connection<TNode, TResponse, TItem>,
    protected response: TResponse,
  ) {}
  get hasNextPage() {
    return this.connection.resolveHasNextPage(this.response);
  }
  get hasPreviousPage() {
    return this.connection.resolveHasPreviousPage(this.response);
  }
  get startCursor(): string | Promise<string> {
    const items = this.connection.getItems(this.response);
    return this.connection.resolveCursor(items[0]);
  }
  get endCursor(): string | Promise<string> {
    const items = this.connection.getItems(this.response);
    return this.connection.resolveCursor(items[items.length - 1]);
  }
}

export class Edge<TNode, TResponse = any, TItem = any> {
  constructor(
    protected connection: Connection<TNode, TResponse, TItem>,
    protected item: TItem,
  ) {}
  get node() {
    return this.connection.resolveNode(this.item);
  }
  get cursor() {
    return this.connection.resolveCursor(this.item);
  }
}
