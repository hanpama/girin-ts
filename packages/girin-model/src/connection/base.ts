import { emptyObject } from "../utils/base";

export abstract class ConnectionQueryBuilder<TNode, TResponse = any, TItem = any> {
  createConnection(connectionArgs: any = emptyObject): Connection<TNode, TResponse, TItem> {
    return new Connection(this, connectionArgs);
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
  abstract query(connectionArgs: any): Promise<TResponse>;
}

export class Connection<TNode, TResponse, TItem> {
  constructor(
    protected queryBuilder: ConnectionQueryBuilder<TNode, TResponse, TItem>,
    protected connectionArgs: any,
  ) { }

  protected _queryPromise: Promise<TResponse> | null = null;
  protected _query() {
    return this.queryBuilder.query(this.connectionArgs);
  }
  protected query() {
    if (!this._queryPromise) { this._queryPromise = this._query(); }
    return this._queryPromise;
  }

  get edges() {
    const { queryBuilder } = this;
    return this.query().then(res => {
      const items = queryBuilder.getItems(res);
      const edges: Edge<TNode, TResponse, TItem>[] = [];
      for (let i = 0; i < items.length; i++) {
        edges.push(queryBuilder.resolveEdge(items[i]));
      }
      return edges;
    })
  }

  get pageInfo() {
    return this.query().then(res => {
      return this.queryBuilder.resolvePageInfo(res);
    })
  }
}

export class PageInfo<TNode, TResponse, TItem> {
  constructor(
    protected queryBuilder: ConnectionQueryBuilder<TNode, TResponse, TItem>,
    protected response: TResponse,
  ) {}
  get hasNextPage() {
    return this.queryBuilder.resolveHasNextPage(this.response);
  }
  get hasPreviousPage() {
    return this.queryBuilder.resolveHasPreviousPage(this.response);
  }
  get startCursor(): string | Promise<string> {
    const items = this.queryBuilder.getItems(this.response);
    return this.queryBuilder.resolveCursor(items[0]);
  }
  get endCursor(): string | Promise<string> {
    const items = this.queryBuilder.getItems(this.response);
    return this.queryBuilder.resolveCursor(items[items.length - 1]);
  }
}

export class Edge<TNode, TResponse, TItem> {
  constructor(
    protected queryBuilder: ConnectionQueryBuilder<TNode, TResponse, TItem>,
    protected item: TItem,
  ) {}
  get node() {
    return this.queryBuilder.resolveNode(this.item);
  }
  get cursor() {
    return this.queryBuilder.resolveCursor(this.item);
  }
}
