export interface ConnectionArguments {
  first?: number | null;
  last?: number | null;
  after?: string | null;
  before?: string | null;
}

/**
 * GraphQL Relay Cursor Connections
 * https://facebook.github.io/relay/graphql/connections.htm
 */
export abstract class Connection<TNode, TEdgeSource> {

  /**
   * Initialize a Connection object with pagination arguments
   * @param args Connection arguments for pagination
   */
  constructor(protected args: ConnectionArguments) {
    if (args.first && args.first < 0) {
      throw new Error('Argument "first" must be a non-negative integer');
    }
    if (args.last && args.last < 0) {
      throw new Error('Argument "last" must be a non-negative integer');
    }
  }

  /**
   * A list of edges.
   */
  get edges(): MaybePromise<Edge<Connection<TNode, TEdgeSource>>[]> {
    const maybePromise = this.getEdgeSources();
    if (isPromise(maybePromise)) {
      return maybePromise.then(edgeSources => (
        edgeSources.map(source => this.resolveEdge(source))
      ));
    } else {
      return maybePromise.map(source => this.resolveEdge(source));
    }
  }

  /**
   * Information to aid in pagination.
   */
  get pageInfo() {
    return new PageInfo(this);
  }

  /**
   * Resolve the cursor from its edge source
   * @param edgeSource
   */
  abstract resolveCursor(edgeSource: TEdgeSource): MaybePromise<string>;

  /**
   * Resolve the node from its edge source
   * @param edgeSource
   */
  abstract resolveNode(edgeSource: TEdgeSource): MaybePromise<TNode>;

  /**
   * Resolve this connection has the next page
   */
  abstract resolveHasNextPage(): MaybePromise<boolean>;
  /**
   * Resolve this connection has the previous page
   */
  abstract resolveHasPreviousPage(): MaybePromise<boolean>;

  abstract getEdgeSources(): MaybePromise<TEdgeSource[]>;

  resolveEdge(edgeSource: TEdgeSource): Edge<Connection<TNode, TEdgeSource>> {
    return new Edge(this, edgeSource);
  }

  async resolveStartCursor(): Promise<string | null> {
    const sources = await this.getEdgeSources();
    const firstSource = sources[0];
    return firstSource ? this.resolveCursor(firstSource) : null;
  }
  async resolveEndCursor(): Promise<string | null> {
    const sources = await this.getEdgeSources();
    const lastSource = sources[sources.length - 1];
    return lastSource ? this.resolveCursor(lastSource) : null;
  }
}


/**
 * An edge in a connection.
 * https://facebook.github.io/relay/graphql/connections.htm#sec-Edge-Types
 */
export class Edge<TConnection extends Connection<any, any>> {
  constructor(protected connection: TConnection, private source: any) {}
  /**
   * The item at the end of the edge
   */
  get node() {
    return this.connection.resolveNode(this.source) as ReturnType<TConnection['resolveNode']>;
  }
  /**
   * A cursor for use in pagination
   */
  get cursor() {
    return this.connection.resolveCursor(this.source) as ReturnType<TConnection['resolveCursor']>;
  }
}

/**
 * Information about pagination in a connection.
 * https://facebook.github.io/relay/graphql/connections.htm#sec-undefined.PageInfo
 */
export class PageInfo<TConnection extends Connection<any, any>> {
  constructor(protected connection: TConnection) {}
  /**
   * When paginating forwards, are there more items?
   */
  get hasNextPage() {
    return this.connection.resolveHasNextPage() as ReturnType<TConnection['resolveHasNextPage']>;
  }
  /**
   * When paginating backwards, are there more items?
   */
  get hasPreviousPage() {
    return this.connection.resolveHasPreviousPage() as ReturnType<TConnection['resolveHasPreviousPage']>;
  }
  /**
   * When paginating backwards, the cursor to continue.
   */
  get startCursor() {
    return this.connection.resolveStartCursor() as ReturnType<TConnection['resolveStartCursor']>;
  }
  /**
   * When paginating forwards, the cursor to continue.
   */
  get endCursor() {
    return this.connection.resolveEndCursor() as ReturnType<TConnection['resolveEndCursor']>;
  }
}

export type MaybePromise<T> = T | Promise<T>;

export function isPromise<T = any>(value: MaybePromise<T>): value is Promise<T> {
  return Boolean(value && typeof (value as Promise<T>).then === 'function');
}
