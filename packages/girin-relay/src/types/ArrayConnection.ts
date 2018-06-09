import { Connection, PageInfo } from ".";
import { ConnectionArguments, getOffsetWithDefault } from "graphql-relay";


export class ArrayConnection<T> extends Connection<T, T[]> {
  constructor(arraySlice: T[], args: ConnectionArguments) {

    const { after, before, first, last } = args;
    const sliceStart = 0;
    const sliceEnd = sliceStart + arraySlice.length;
    const arrayLength = arraySlice.length;
    const beforeOffset = getOffsetWithDefault(before, arrayLength);
    const afterOffset = getOffsetWithDefault(after, -1);

    let startOffset = Math.max(
      sliceStart - 1,
      afterOffset,
      -1
    ) + 1;
    let endOffset = Math.min(
      sliceEnd,
      beforeOffset,
      arrayLength
    );
    if (typeof first === 'number') {
      if (first < 0) {
        throw new Error('Argument "first" must be a non-negative integer');
      }

      endOffset = Math.min(
        endOffset,
        startOffset + first
      );
    }
    if (typeof last === 'number') {
      if (last < 0) {
        throw new Error('Argument "last" must be a non-negative integer');
      }

      startOffset = Math.max(
        startOffset,
        endOffset - last
      );
    }
    const slice = arraySlice.slice(
      Math.max(startOffset - sliceStart, 0),
      arraySlice.length - (sliceEnd - endOffset)
    );

    super(slice, {});
    // this.source =

  }

  public get edges() {
    return this.source;
  }

  public get pageInfo() {
    const arraySlice = this.source;

    const { sliceStart, arrayLength } = meta;
    const sliceEnd = sliceStart + arraySlice.length;

    return new PageInfo()
  }
}