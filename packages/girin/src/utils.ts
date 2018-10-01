export const emptyObject = Object.create(null);
export const emptyArray = [];

export function assert(expression: any, description?: string) {
  if (!expression) {
    throw new Error(`Assertion Error: ${description}`);
  }
}

export function toBase64(i: string): string {
  return Buffer.from(i, 'utf8').toString('base64');
}

export function fromBase64(i: string): string {
  return Buffer.from(i, 'base64').toString('utf8');
}

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
    var l = 0;
    var r = entries.length - 1;
    var m: number;
    var comp: number;
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
