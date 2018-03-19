const memoizedBuildMap: Map<any, { [key: string]: any }> = new Map();

export function memoizedGetter<T>(target: T, name: string, descriptor: TypedPropertyDescriptor<any>) {
  const innerGetter = descriptor.get;

  return {
    get(this: T) {
      let buildMap = memoizedBuildMap.get(this);
      if (!buildMap) {
        buildMap = {};
        memoizedBuildMap.set(this, buildMap);
      }

      let memoized = buildMap![name];
      if (!memoized) {
        memoized = innerGetter!.apply(this);
        buildMap![name] = memoized;
      }
      return memoized;
    }
  };
}
