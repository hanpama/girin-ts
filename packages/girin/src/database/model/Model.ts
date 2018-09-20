import { FilterQuery, CollectionInsertOneOptions, ReplaceOneOptions, CommonOptions, MongoClient } from 'mongodb';
import { ModelManager } from './ModelManager';


export type Document = { [key: string]: any };

export type ModelClass<TModel extends Model> = typeof Model & {
  new(source: any): TModel;
}

export interface ModelConfigs {
  client?: MongoClient;
  dbName: string;
}

export class Model {
  static limit: number = 50;
  static collectionName: string;

  // configuration
  static _configs: ModelConfigs = { dbName: 'test' };
  public static get configs() {
    return this._configs;
  }
  public static configure(configs: Partial<ModelConfigs>) {
    Object.assign(this._configs, configs);
  }

  // meta and context
  protected static manager: any;
  public static getManager<TModel extends Model>(this: ModelClass<TModel>) {
    if (!this.manager) {
      this.manager = new ModelManager(this);
    }
    return this.manager as ModelManager<TModel>;
  }
  public $getManager(): ModelManager<this> { return (this.constructor as any).getManager(); }

  public static create<TModel extends Model>(this: ModelClass<TModel>, source: any) {
    return source ? new this(source) : null;
  }

  // shortcuts and dataloader
  public static async insert<TModel extends Model>(this: ModelClass<TModel>, source: Document, options?: CollectionInsertOneOptions): Promise<TModel> {
    await this.getManager().collection.insertOne(source, options);
    return new this(source) as any;
  }

  public static findOne<TModel extends Model>(this: ModelClass<TModel>, query: FilterQuery<TModel>): Promise<TModel> {
    return this.getManager().collection.findOne(query).then(this.create.bind(this));
  }

  public static findMany<TModel extends Model>(this: ModelClass<TModel>, query: FilterQuery<TModel>): Promise<(TModel | null)[]> {
    return this.getManager().collection.find(query).toArray().then(docs => docs.map(doc => this.create(doc)));
  }

  public static async getOne<TModel extends Model> (this: ModelClass<TModel>, id: any): Promise<TModel | null> {
    return this.getManager().dataloader.load(id).then(this.create.bind(this));
  }

  public static async getMany<TModel extends Model> (this: ModelClass<TModel>, ids: any[]): Promise<(TModel | null)[]> {
    return this.getManager().dataloader.loadMany(ids).then(docs => docs.map(doc => this.create(doc)));
  }

  public set _id(value: any) { this.$source._id = value; }
  public get _id() { return this.$source._id; }

  protected $source: Document;
  constructor(source?: Document) {
    this.$source = source || {};
  }

  ///////////////////////////////////////////
  // model methods
  //
  public async $pull(): Promise<this> {
    const doc = await this.$getManager().dataloader.load(this._id);
    this.$source = doc;
    return this;
  }

  public async $save(): Promise<this> {
    const { collection } = this.$getManager();
    const { $source } = this;

    if (!this._id) {
      const res = await collection.insertOne($source);
      this._id = res.insertedId;
    } else {
      const { _id, ...rest } = $source;
      await this.$update({ $set: rest });
    }
    return this;
  }

  public $update(operators: Object, options?: ReplaceOneOptions): Promise<any> { // review
    const { _id } = this.$source;
    if (!_id) {
      throw new Error('Cannot update a model instance with no _id');
    }
    return this.$getManager().collection.updateOne({ _id: _id || null }, operators, options);
  }

  public async $delete(options?: CommonOptions & { bypassDocumentValidation?: boolean }): Promise<string> {
    const { _id } = this;
    if (!_id) { throw new Error('Cannot delete a model instance with no _id'); }
    await this.$getManager().collection.deleteOne({ _id }, options);
    return _id;
  }
}

export function field(alias?: string) {
  return function(prototype: any, propertyKey: string) {
    const fieldName = alias || propertyKey;

    const get = function() {
      if (this.$source[fieldName]) {
        return this.$source[fieldName];
      } else {
        return this.$pull().then(() => this.$source[fieldName]);
      }
    }
    const set = function(value: any) {
      this.$source[fieldName] = value;
    }
    Object.defineProperty(prototype, propertyKey, { get, set });
  }
}
