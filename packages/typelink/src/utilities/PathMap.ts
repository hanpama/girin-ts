export class PathMap<K, V> {
  protected children: Map<K, PathMap<K, V>> = new Map();
  protected value: V;

  get(path: K[]) {
    let submap: PathMap<K, V> = this;
    for (let i = 0; i < path.length; i++) {
      const item = submap.children.get(path[i]);
      if (item === undefined) {
        return undefined;
      } else {
        submap = item;
      }
    }
    return submap.value;
  }
  set(path: K[], value: V) {
    let submap: PathMap<K, V> = this;
    for (let i = 0; i < path.length; i++) {
      let item = submap.children.get(path[i]);
      if (item === undefined) {
        item = new PathMap();
        submap.children.set(path[i], item);
        submap = item;
      } else {
        submap = item;
      }
    }
    submap.value = value;
  }
}
