import { Connection, ConnectionArguments, Edge } from '@girin/connection';
import { Model, ModelClass } from '../models';
import { Document } from '../types';


export interface SortEntry {
  fieldName: string;
  order: 1 | -1;
}

export interface Selector { [fieldName: string]: any; }

export interface ModelConnectionOptions {
  sortOptions: { [fieldName: string]: 1 | -1 };
  limit: number;
  selector?: Selector;
}

export class ModelConnection<
  TNode extends Model,
  TItem extends Document = Document
> extends Connection<TNode, TItem> {

  protected limit: number;
  public sortOptions: SortEntry[];
  protected afterKey?: any[];
  protected beforeKey?: any[];
  protected afterSelector?: Selector;
  protected beforeSelector?: Selector;
  protected selector: Selector;

  constructor(public modelClass: ModelClass<TNode>, args: ConnectionArguments, public options: ModelConnectionOptions) {
    super(args);
    if (args.first && args.last) {
      throw new Error('Argument "first" and "last" must not be included at the same time');
    }
    this.sortOptions = Object.keys(options.sortOptions)
      .map(fieldName => ({ fieldName, order: options.sortOptions[fieldName] }));

    if (typeof args.first !== 'number' && typeof args.last !== 'number') {
      this.args = { ...args, first: options.limit };
    }

    this.limit = Math.min(options.limit, args.first || args.last || options.limit);

    const selectors: Selector[] = [];
    if (args.after) {
      this.afterKey = this.explodeCursor(args.after);
      this.afterSelector = this.keyToSelector(this.afterKey, 'after');
      selectors.push(this.afterSelector);
    }
    if (args.before) {
      this.beforeKey = this.explodeCursor(args.before);
      this.beforeSelector = this.keyToSelector(this.beforeKey, 'before');
      selectors.push(this.beforeSelector);
    }
    if (options.selector) {
      selectors.push(options.selector);
    }
    if (selectors.length === 0) {
      this.selector = {};
    } else if (selectors.length === 1) {
      this.selector = selectors[0];
    } else {
      this.selector = { $and: selectors };
    }
  }

  public edges: Promise<Edge<ModelConnection<TNode, TItem>>[]>;

  resolveCursor(item: TItem): string {
    const key = this.sortOptions.map(({ fieldName }) => item[fieldName as keyof TItem]);
    return Buffer.from(JSON.stringify(key)).toString('base64');
  }

  resolveNode(item: TItem): TNode {
    const { modelClass } = this;
    return new modelClass(item) as TNode;
  }

  async resolveHasNextPage() {
    const { first, before } = this.args;
    const { collection } = this.modelClass.getManager();

    if (typeof first === 'number') {
      const limitOrMore = await collection.countDocuments(this.selector, { limit: first + 1 });
      return limitOrMore > first;
    }
    if (typeof before === 'string') {
      const afterBeforeSelector = this.keyToSelector(this.beforeKey!, 'after');
      const oneOrZero = await collection.countDocuments(afterBeforeSelector, { limit: 1 });
      return oneOrZero > 0;
    }
    return false;
  }

  async resolveHasPreviousPage() {
    const { last, after } = this.args;
    const { collection } = this.modelClass.getManager();

    if (typeof last === 'number') {
      const limitOrMore = await collection.countDocuments(this.selector, { limit: last + 1 });
      return limitOrMore > last;
    }
    if (typeof after === 'string') {
      const beforeAfterSelector = this.keyToSelector(this.afterKey!, 'before');
      const oneOrZero = await collection.countDocuments(beforeAfterSelector, { limit: 1 });
      return oneOrZero > 0;
    }
    return false;
  }

  getEdgeSources(): Promise<TItem[]> {
    if (!this.queryPromise) {
      this.queryPromise = this.query();
    }
    return this.queryPromise;
  }

  async query(): Promise<TItem[]> {
    const reverse = typeof this.args.last === 'number';
    const appliedSortOrder = this.sortOptions.reduce((results, { fieldName, order }) => {
      results[fieldName] = order * (reverse ? -1 : 1);
      return results;
    }, {} as any);

    const cursor = this.modelClass.getManager().collection
      .find(this.selector)
      .sort(appliedSortOrder)
      .limit(this.limit);

    const docs = await cursor.toArray();
    if (reverse) { docs.reverse(); }
    return docs;
  }

  protected queryPromise: Promise<TItem[]> | null = null;

  protected explodeCursor(cursor: string): any[] {
    const buffer = Buffer.from(cursor, 'base64');
    return JSON.parse(buffer.toString());
  }

  protected keyToSelector(key: any[], direction: 'after' | 'before') {
    const eq = direction === 'after'
      ? ['$gt', '$lt', '$gte', '$lte']
      : ['$lt', '$gt', '$lte', '$gte'];
    const { sortOptions } = this;
    const $or: any = [];

    for (let i = 0; i < sortOptions.length; i++) {
      const selector = key.slice(0, i + 1).reduce((selector, item, idx) => {
        const { fieldName, order } = sortOptions[idx];
        let equality: string;
        if (idx === i) {
          equality = order === 1 ? eq[0] : eq[1];
        } else {
          equality = order === 1 ? eq[2] : eq[3];
        }
        selector[fieldName] = { [equality]: item };
        return selector;
      }, {} as any);
      $or.push(selector);
    }
    return { $or };
  }
}
