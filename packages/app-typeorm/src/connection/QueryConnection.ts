import { SelectQueryBuilder, Brackets, Repository } from 'typeorm';
import { Connection, ConnectionArguments, Edge } from '@girin/connection';


export interface SortEntry {
  sort: string;
  order: 'ASC' | 'DESC';
}

export interface QueryConnectionOptions<Entity> {
  sortOptions: SortEntry[];
  repository: Repository<Entity>;
  where?: (qb: SelectQueryBuilder<Entity>) => any;
}

export class QueryConnection<Entity extends Object> extends Connection<Entity, Entity> {

  public get repository() { return this.options.repository; }
  public get sortOptions() { return this.options.sortOptions; }
  public get where() { return this.options.where; }
  protected get alias() { return 'node'; }

  protected limit?: number;
  protected afterKey?: any[];
  protected beforeKey?: any[];
  protected afterSelector?: Brackets;
  protected beforeSelector?: Brackets;

  constructor(
    args: ConnectionArguments,
    public options: QueryConnectionOptions<Entity>,
  ) {
    super(args);
    if (args.first && args.last) {
      throw new Error('Argument "first" and "last" must not be included at the same time');
    }

    this.limit = args.first || args.last || undefined;

    if (args.after) {
      this.afterKey = this.explodeCursor(args.after);
      this.afterSelector = this.keyToSelector(this.afterKey, 'after');
    }
    if (args.before) {
      this.beforeKey = this.explodeCursor(args.before);
      this.beforeSelector = this.keyToSelector(this.beforeKey, 'before');
    }
  }

  public edges: Promise<Edge<QueryConnection<Entity>>[]>;

  resolveCursor(item: Entity): string {
    const key = this.sortOptions.map(({ sort }) => item[sort as keyof Entity]);
    return Buffer.from(JSON.stringify(key)).toString('base64');
  }

  resolveNode(item: Entity): Entity {
    return item;
  }

  async resolveHasNextPage() {
    const { first, before } = this.args;

    if (typeof first === 'number') {
      const queryBuilder = this.getAppliedQueryBuilder();
      const limitOrMore = await queryBuilder.getCount();
      return limitOrMore > first;
    }
    if (typeof before === 'string') {
      const afterBeforeSelector = this.keyToSelector(this.beforeKey!, 'after');
      const queryBuilder = this.repository.createQueryBuilder();

      const countAfterBefore = await queryBuilder.andWhere(afterBeforeSelector).getCount();
      return countAfterBefore > 0;
    }
    return false;
  }

  async resolveHasPreviousPage() {
    const { last, after } = this.args;

    if (typeof last === 'number') {
      const queryBuilder = this.getAppliedQueryBuilder();
      const limitOrMore = await queryBuilder.limit(last + 1).getCount();
      return limitOrMore > last;
    }
    if (typeof after === 'string') {
      const beforeAfterSelector = this.keyToSelector(this.afterKey!, 'before');
      const queryBuilder = this.repository.createQueryBuilder();
      const countBeforeAfter = await queryBuilder.andWhere(beforeAfterSelector).limit(1).getCount();
      return countBeforeAfter > 0;
    }
    return false;
  }

  getEdgeSources(): Promise<Entity[]> {
    if (!this.queryPromise) {
      this.queryPromise = this.query();
    }
    return this.queryPromise;
  }

  async query(): Promise<Entity[]> {
    const { sortOptions } = this;

    const queryBuilder = this.getAppliedQueryBuilder();

    const reverse = typeof this.args.last === 'number';
    const appliedOrderMap: any = {
      ASC: reverse ? 'DESC' : 'ASC',
      DESC: reverse ? 'ASC' : 'DESC',
    };
    queryBuilder.orderBy();
    for (let i = 0; i < sortOptions.length; i++) {
      const { sort, order } = sortOptions[i];
      queryBuilder.addOrderBy(`${sort}`, appliedOrderMap[order]);
    }

    if (this.limit) {
      queryBuilder.limit(this.limit);
    }

    const entities = await queryBuilder.getMany();
    if (reverse) { entities.reverse(); }
    return entities;
  }

  protected queryPromise: Promise<Entity[]> | null = null;

  getAppliedQueryBuilder() {

    const queryBuilder = this.repository.createQueryBuilder();
    if (this.where) { queryBuilder.andWhere(this.where); }
    if (this.afterSelector) { queryBuilder.andWhere(this.afterSelector); }
    if (this.beforeSelector) { queryBuilder.andWhere(this.beforeSelector); }
    return queryBuilder;
  }

  protected explodeCursor(cursor: string): any[] {
    const buffer = Buffer.from(cursor, 'base64');
    return JSON.parse(buffer.toString());
  }

  protected keyToSelector(key: any[], direction: 'after' | 'before'): Brackets {
    const eq = direction === 'after'
      ? ['>', '<', '>=', '<=']
      : ['<', '>', '<=', '>='];
    const { sortOptions } = this;

    return new Brackets(rootQb => {
      for (let i = 0; i < sortOptions.length; i++) {
        const subKeySetComparison = new Brackets(qb => {
          const subKeySet = key.slice(0, i + 1);

          for (let j = 0; j < subKeySet.length; j++) {
            const { sort, order } = sortOptions[j];
            const cursorKey = subKeySet[j];
            const paramterName = `${direction}__${sort}`;

            let equality: string;
            if (j === i) {
              equality = (order === 'ASC') ? eq[0] : eq[1];
            } else {
              equality = (order === 'ASC') ? eq[2] : eq[3];
            }
            qb.andWhere(`${sort} ${equality} :${paramterName}`, { [paramterName]: cursorKey });
          }
        });
        rootQb.orWhere(subKeySetComparison);
      }
    });
  }
}
