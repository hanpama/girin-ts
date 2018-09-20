function compareKey(key1: any, key2: any): 1 | 0 | -1 {
  const h1 = key1;
  const h2 = key2;
  if (h1 > h2) {
    return 1;
  } else if (h1 === h2) {
    return 0;
  } if (h1 < h2) {
    return -1;
  } else {
    return compareKey(String(h1), String(h2));
  }
}

export class CompositeKeySorter {
  constructor(keys: any[]) {
    this.entries = keys
      .map((key, idx) => [key, idx])
      .sort((a, b) => compareKey(a[0], b[0]));
  }
  protected entries: any[];

  indexOf(key: any): number {
    const { entries } = this;
    var l = 0;
    var r = entries.length - 1;
    var m: number;
    var comp: number;
    while (l <= r) {
      m = Math.floor((l + r) / 2);
      comp = compareKey(entries[m][0], key);
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
