export class CompositeKeySorter<T> {
  /**
   *
   * @param keys
   * @param compareKey
   */
  constructor(keys: T[], protected compareKey: (key1: T, key2: T) => 1 | 0 | -1) {
    this.entries = keys
      .map((key, idx) => [key, idx] as [T, number])
      .sort((a, b) => compareKey(a[0], b[0]));
  }
  protected entries: [T, number][];

  indexOf(key: T): number {
    const { entries } = this;
    let l = 0;
    let r = entries.length - 1;
    let m: number;
    let comp: number;
    while (l <= r) {
      m = Math.floor((l + r) / 2);
      comp = this.compareKey(entries[m][0], key);
      if (comp === 0) {
        return entries[m][1];
      } else if (comp === -1) {
        l = m + 1;
      } else {
        r = m - 1;
      }
    }
    return -1;
  }
}

export function resolveMaybeThunk<T>(maybeThunk: MaybeThunk<T>): T {
  // Arrow functions have no prototype
  if (maybeThunk instanceof Function && maybeThunk.prototype === undefined) {
    return maybeThunk() as T;
  }
  return maybeThunk as unknown as T;
}

export type MaybeThunk<T> = T | (() => T);
