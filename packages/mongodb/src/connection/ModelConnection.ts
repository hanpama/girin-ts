import { gzip, gunzip, InputType } from 'zlib';
import { promisify } from 'util';

import * as equal from 'fast-deep-equal';

import { Connection, ConnectionArguments } from '@girin/relay/connection';
import { Model, ModelClass, Document } from '../models';


const gzipPromise = promisify<InputType, Buffer>(gzip);
const gunzipPromise = promisify<InputType, Buffer>(gunzip);

export interface SortOption {
  fieldName: string;
  order: 1 | -1;
}

export interface Selector { [fieldName: string]: any; }

export interface ModelConnectionOptions<TModel extends Model> {
  sortOptions: SortOption[] & { 0: SortOption };
  modelClass: ModelClass<TModel>;
  maxLimit: number;
  selector?: Selector;
}

export interface ModelConnectionState {
  docs: any[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class ModelConnection<
  TNode extends Model,
  TItem extends Document = Document
> extends Connection<TNode, ModelConnectionState, TItem> {

  constructor(args: ConnectionArguments, public options: ModelConnectionOptions<TNode>) {
    super(args);
    if (args.first && args.last) {
      throw new Error('Argument "first" and "last" must not be included at the same time');
    }
  }

  async resolveCursor(item: TItem): Promise<string> {
    const key = this.options.sortOptions.map(({ fieldName }) => item[fieldName as keyof TItem]);
    const val = await gzipPromise(JSON.stringify(key));
    return val.toString('base64');
  }

  async expandCursor(cursor: string): Promise<any[]> {
    const buffer = Buffer.from(cursor, 'base64');
    const jsonBuffer = await gunzipPromise(buffer);
    return JSON.parse(jsonBuffer.toString('utf8'));
  }

  keyToSelector(key: any[], type: 'bottom' | 'top') {
    const eq = type === 'bottom'
      ? ['$gt', '$lt', '$gte', '$lte']
      : ['$lt', '$gt', '$lte', '$gte'];
    const { sortOptions } = this.options;
    const $or: any = [];

    for (let i = 0; i < sortOptions.length; i++) {
      const selector = key.slice(0, i + 1).reduce((selector, item, idx) => {
        const { fieldName, order } = sortOptions[idx];
        let equality: string;
        if (idx === i && i !== sortOptions.length - 1) {
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

  resolveNode(item: TItem): TNode {
    const { modelClass } = this.options;
    return new modelClass(item) as TNode;
  }
  resolveHasNextPage(response: ModelConnectionState): boolean | Promise<boolean> {
    return response.hasNextPage;
  }
  resolveHasPreviousPage(response: ModelConnectionState): boolean | Promise<boolean> {
    return response.hasPreviousPage;
  }
  getItems(response: ModelConnectionState): ArrayLike<TItem> {
    return response.docs;
  }

  async query(): Promise<ModelConnectionState> {
    const { options, args } = this;
    const reverse = Boolean(args.last);

    let selectors: any[] = options.selector ? [options.selector] : [];
    let bottom: any[] | undefined;
    let top: any[] | undefined;
    if (args.after) {
      bottom = await this.expandCursor(args.after);
      selectors = selectors.concat(this.keyToSelector(bottom, 'bottom'));
    }
    if (args.before) {
      top = await this.expandCursor(args.before);
      selectors = selectors.concat(this.keyToSelector(top, 'top'));
    }
    const limit = Math.min(
      options.maxLimit,
      args.first || args.last || this.options.maxLimit,
    );

    const extraAdjacent = 0 + (top ? 1 : 0) + (bottom ? 1 : 0);
    const appliedSortOrder = options.sortOptions.reduce((results, { fieldName, order }) => {
      results[fieldName] = order * (reverse ? -1 : 1);
      return results;
    }, {} as any);
    let selector: any;
    if (selectors.length === 0) {
      selector = {};
    } else if (selectors.length === 1) {
      selector = selectors[0];
    } else {
      selector = { $and: selectors };
    }

    let cursor = options.modelClass.getManager().collection
      .find(selector)
      .sort(appliedSortOrder)
      .limit(limit + extraAdjacent);

    const docs = await cursor.toArray();

    const start = reverse ? top : bottom;
    const end = reverse ? bottom : top;
    let hasBefore = false;
    let hasAfter = docs.length === limit + extraAdjacent;
    if (docs.length > 0) {
      // head trimming
      if (start) {
        docs.shift();
        hasBefore = true;
      }
      // tail trimming
      while (docs.length > 0) {
        if (docs.length > limit) {
          docs.pop();
          hasAfter = true;
          continue;
        }
        const lastDocKeys = options.sortOptions.map(({ fieldName }) => {
          return docs[docs.length - 1][fieldName];
        });
        if (end) {
          const shouldTrim = equal(lastDocKeys, end);
          if (shouldTrim) {
            docs.pop();
            hasAfter = true;
            continue;
          }
        }
        break;
      }
    }
    // apply order
    if (reverse) { docs.reverse(); }

    return {
      docs,
      hasNextPage: reverse ? hasBefore : hasAfter,
      hasPreviousPage: reverse ? hasAfter : hasBefore,
    };
  }
}
