import { FilterQuery, CollectionInsertOneOptions, ReplaceOneOptions, CommonOptions, ObjectID, FindAndModifyWriteOpResultObject } from 'mongodb';
import { ModelManager } from './ModelManager';
import { MongoDBModule } from '../module';


export type Document = {
  [key: string]: any,
  _id?: ObjectID;
};

export type ModelClass<TModel extends Model> = typeof Model & {
  new(source: any): TModel;
}

/**
 * Model object acts as a simple container of document including _id
 * with useful static and prototype methods for dealing with data.
 *
 * The prototype methods has names starting with dollar sign($) to
 * avoid name collision in GraphQL type.
 */
export class Model {
  static limit: number = 50;

  /**
   * returns lowercased class name as its collection name by default.
   */
  static get collectionName(): string {
    return this._collectionName || this.name.toLowerCase();
  };
  static set collectionName(value: string) {
    this._collectionName = value;
  }
  protected static _collectionName?: string;


  // meta and context
  protected static manager: any;
  public static getManager<TModel extends Model>(this: ModelClass<TModel>) {
    if (!this.manager) {
      this.manager = new ModelManager(this, MongoDBModule.object());
    }
    return this.manager as ModelManager;
  }
  public $getManager(): ModelManager { return (this.constructor as any).getManager(); }

  public static create<TModel extends Model>(this: ModelClass<TModel>, source: any) {
    return source ? new this(source) : null;
  }

  // shortcuts and dataloader
  public static async insert<TModel extends Model>(this: ModelClass<TModel>, source: Document, options?: CollectionInsertOneOptions): Promise<TModel> {
    await this.getManager().collection.insertOne(source, options);
    return new this(source) as any;
  }

  public static async findOne<TModel extends Model>(this: ModelClass<TModel>, query: FilterQuery<TModel>): Promise<TModel | null> {
    const doc = await this.getManager().collection.findOne(query);
    return this.create(doc);
  }

  public static async findMany<TModel extends Model>(this: ModelClass<TModel>, query: FilterQuery<TModel>): Promise<TModel[]> {
    const docs = await this.getManager().collection.find(query).toArray();
    return docs.map(doc => this.create(doc)!);
  }

  public static async getOne<TModel extends Model> (this: ModelClass<TModel>, id: string | ObjectID): Promise<TModel | null> {
    const coercedId = new ObjectID(id);
    return this.getManager().dataloader.load(coercedId).then(doc => this.create(doc));
  }

  public static async getMany<TModel extends Model> (this: ModelClass<TModel>, ids: Array<string | ObjectID>): Promise<(TModel | null)[]> {
    const coercedIds = ids.map(id => new ObjectID(id));
    const docs = await this.getManager().dataloader.loadMany(coercedIds);
    return docs.map(doc => this.create(doc));
  }

  public set _id(value: string | undefined) {
    this.$source._id = typeof value === 'string' ? new ObjectID(value) : value;
  }
  public get _id() { return this.$source._id && String(this.$source._id); }
  /**
   * proxy getter for the document's _id
   */
  public get id() { return this._id; }

  /**
   * state object of the model object
   */
  protected $source: Document;
  constructor(source?: Document) {
    this.$source = source || {};
  }

  ///////////////////////////////////////////
  // model methods
  //
  /**
   * Update this model's state with a document fetched from database
   */
  public async $pull(): Promise<this> {
    if (!this.$source._id) {
      throw new Error('Cannot pull the document: the model object has no _id')
    }
    const doc = await this.$getManager().dataloader.load(this.$source._id);
    this.$source = doc;
    return this;
  }

  /**
   * If this model has _id, try to $set model's state to the corresponding document.
   * if not, insert the model's state to collection.
   */
  public async $save(): Promise<this> {
    const { collection } = this.$getManager();
    const { $source } = this;

    if (!this._id) {
      const res = await collection.insertOne($source);
      this.$source._id = res.insertedId;
    } else {
      const { _id, ...rest } = $source;
      await this.$update({ $set: rest });
    }
    return this;
  }

  /**
   * Update this model object with update operator
   * @param operators update operator
   * @param options MongoDB update operation options
   */
  public async $update(operators: Object, options?: ReplaceOneOptions): Promise<FindAndModifyWriteOpResultObject> {
    const { _id } = this.$source;
    if (!_id) {
      throw new Error('Cannot update a model instance with no _id');
    }
    return await this.$getManager()
      .collection.findOneAndUpdate({ _id: _id || null }, operators, options);

    // return this;
  }

  /**
   * Delete model's corresponding document in collection
   * @param options MongoDB delete opration options
   */
  public async $delete(options?: CommonOptions & { bypassDocumentValidation?: boolean }): Promise<string> {
    const { _id } = this.$source;
    if (!_id) { throw new Error('Cannot delete a model instance with no _id'); }
    await this.$getManager().collection.deleteOne({ _id }, options);
    return String(_id);
  }
}

export function field(alias?: string) {
  return function(prototype: any, propertyKey: string) {
    const fieldName = alias || propertyKey;
    const get = function getField() { return this.$source[fieldName]; }
    const set = function setField(value: any) { this.$source[fieldName] = value; }
    Object.defineProperty(prototype, propertyKey, { get, set });
  }
}
