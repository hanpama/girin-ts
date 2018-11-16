import { Connection, ConnectionArguments, Edge } from '@girin/connection';
import { getOffsetWithDefault, offsetToCursor } from 'graphql-relay';


export abstract class ArrayConnection<TNode, TEdgeSource> extends Connection<TNode, TEdgeSource> {
  constructor(protected array: TEdgeSource[], args: ConnectionArguments) {
    super(args);

    const { after, before, first, last } = args;

    const arrayLength = array.length;
    const beforeOffset = getOffsetWithDefault(before, arrayLength);
    const afterOffset = getOffsetWithDefault(after, -1);

    let startOffset = Math.max(afterOffset + 1, 0);
    let endOffset = Math.min(beforeOffset, arrayLength);
    if (typeof first === 'number') {
      endOffset = Math.min(endOffset, startOffset + first);
    }
    if (typeof last === 'number') {
      startOffset = Math.max(startOffset, endOffset - last);
    }
    this.startOffset = startOffset;
    this.endOffset = endOffset;
    this.afterOffset = afterOffset;
    this.beforeOffset = beforeOffset;
  }

  private startOffset: number;
  private endOffset: number;
  private afterOffset: number;
  private beforeOffset: number;

  getEdgeSources() {
    return this.array.slice(this.startOffset, this.endOffset)
      .map((nodeSource, index) => nodeSource);
  }

  // In most cases, cursors should be resolved from the source
  // But in ArrayConnection example, it formats cursor simply from its index in the array
  get edges() {
    const edgeSources = this.getEdgeSources();
    return edgeSources.map((source, index) => new ArrayConnectionEdge(this, source, this.startOffset + index));
  }
  resolveCursor(): string {
    throw new Error('ArrayConenction uses index based cursor');
  }
  resolveIndexBasedCursor(index: number) {
    return offsetToCursor(index);
  }

  resolveHasNextPage() {
    const { args, endOffset, beforeOffset, array } = this;

    const upperBound = args.before ? beforeOffset : array.length;
    return typeof args.first === 'number' ? endOffset < upperBound : false;
  }
  resolveHasPreviousPage() {
    const { args, startOffset, afterOffset } = this;

    const lowerBound = args.after ? afterOffset + 1 : 0;
    return typeof args.last === 'number' ? startOffset > lowerBound : false;
  }
}

export class ArrayConnectionEdge<TConnection extends ArrayConnection<any, any>> extends Edge<TConnection> {
  constructor(public connection: TConnection, source: any, public index: number) {
    super(connection, source);
  }

  get cursor() {
    return this.connection.resolveIndexBasedCursor(this.index) as ReturnType<TConnection['resolveCursor']>; // ?
  }
}
