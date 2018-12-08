import { Connection, ConnectionArguments } from 'cursor-connection';
import { getOffsetWithDefault, offsetToCursor } from 'graphql-relay';


export abstract class ArrayConnection<TNode, TEdgeSource> extends Connection<TNode, { source: TEdgeSource, index: number }> {
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
      .map((source, index) => ({ source, index: index + this.startOffset }));
  }

  resolveCursor(source: { index: number }) {
    return offsetToCursor(source.index);
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
