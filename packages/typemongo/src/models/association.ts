import { Model, ModelClass } from './Model';
import { ObjectID } from 'bson';


export class HasOne<T extends Model> implements PromiseLike<T | null> {
  constructor(public target: ModelClass<T>, public model: Model, public fieldName: string) {}

  then<TResult1 = T | null, TResult2 = never>(
    onfulfilled?: ((value: T | null) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.get().then(onfulfilled, onrejected);
  }

  get(): Promise<T | null> {
    const targetId = this.model.$source[this.fieldName];

    if (targetId === undefined || targetId === null) {
      return Promise.resolve(null);
    }
    return this.target.getOne(targetId);
  }

  set(value: T) {
    this.setId(value._id);
  }

  setId(id: ObjectID) {
    this.model.$source[this.fieldName] = id;
  }
}

export class HasMany<T extends Model> implements PromiseLike<Array<T | null>> {
  constructor(public target: ModelClass<T>, public model: Model, public fieldName: string) {}

  then<TResult1 = Array<T | null>, TResult2 = never>(
    onfulfilled?: ((value: Array<T | null>) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
  ): PromiseLike<TResult1 | TResult2> {
    const targetId = this.model.$source[this.fieldName];

    if (targetId === undefined || targetId === null) {
      return Promise.resolve([]).then(onfulfilled, onrejected);
    }
    return this.target.getMany(targetId).then(onfulfilled, onrejected);
  }

  set(values: T[]) {
    this.setIds(values.map(value => value._id));
  }

  setIds(ids: ObjectID[]) {
    this.model.$source[this.fieldName] = ids;
  }
}
