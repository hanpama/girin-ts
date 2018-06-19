/**
 * Proxy based lazy async source fetcher
 */
export abstract class AsyncSourceFetcher<TSource, TArgs extends { [key: string]: any }, TID = string> {
  constructor(id: TID, args?: TArgs) {
    this.id = id;
    this.args = args;
    return new Proxy(this, {
      get(target, propName) {
        return (target as any)[propName] || target.fetcher.then(source => (source as any)[propName]);
      },
    });
  }

  public id: TID;
  public args?: TArgs;
  protected _fetcher: Promise<TSource>;
  protected get fetcher() {
    if (!this._fetcher) { this._fetcher = this.fetch(this.id); }
    return this._fetcher;
  }

  protected abstract async fetch(id: TID): Promise<TSource>;
}
