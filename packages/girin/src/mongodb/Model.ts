import { FilterQuery, CollectionInsertOneOptions, ReplaceOneOptions, CommonOptions, ObjectID, FindAndModifyWriteOpResultObject } from 'MongoDB';
import { ModelManager } from './ModelManager';


export type Document = { [key: string]: any };

export type ModelClass<TModel extends Model> = typeof Model & {
  new(source: any): TModel;
}

/**
 * Model object acts as a container of document including _id
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

  public static async findMany<TModel extends Model>(this: ModelClass<TModel>, query: FilterQuery<TModel>): Promise<(TModel | null)[]> {
    const docs = await this.getManager().collection.find(query).toArray();
    return docs.map(doc => this.create(doc));
  }

  public static async getOne<TModel extends Model> (this: ModelClass<TModel>, id: any): Promise<TModel | null> {
    return this.getManager().dataloader.load(id).then(this.create.bind(this));
  }

  public static async getMany<TModel extends Model> (this: ModelClass<TModel>, ids: any[]): Promise<(TModel | null)[]> {
    const docs = await this.getManager().dataloader.loadMany(ids);
    return docs.map(doc => this.create(doc));
  }

  public set _id(value: ObjectID) { this.$source._id = value; }
  public get _id() { return this.$source._id; }
  /**
   * proxy getter for the document's _id
   */
  public get id() { return this.$source._id; }

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
    if (!this._id) {
      throw new Error('Cannot pull the document: the model object has no _id')
    }
    const doc = await this.$getManager().dataloader.load(this._id);
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
      this._id = res.insertedId;
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
  public async $delete(options?: CommonOptions & { bypassDocumentValidation?: boolean }): Promise<ObjectID> {
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
