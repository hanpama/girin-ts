import { Readable } from 'stream';

import {
  MongoClient,
  MongoClientOptions,
  GridFSBucketOptions,
  GridFSBucket,
  ObjectID,
  GridFSBucketOpenUploadStreamOptions,
  MongoError,
} from 'mongodb';
import { ObjectStorage, StorageObjectNotFoundError, StorageObject, FileAlreadyExistsError } from '@girin/framework';


export interface GridFSObjectStorageConfigs {
  url: string;
  clientOptions?: MongoClientOptions;
  gridFSOptions?: {
    [bucket: string]: Pick<GridFSBucketOptions, 'chunkSizeBytes' | 'writeConcern' | 'ReadPreference'>
  };
}

export interface GridFSFile {
  _id: ObjectID;
  length: number;
  chunkSize: number;
  uploadDate: Date;
  filename: string;
  md5: string;
}

export class GridFSObjectStorage extends ObjectStorage {

  constructor(public configs: GridFSObjectStorageConfigs) {
    super();
  }

  async onBootstrap() {
    this.client = new MongoClient(this.configs.url, this.configs.clientOptions);
    await this.client.connect();
  }

  async onDestroy() {
    await this.client.close();
  }

  public client: MongoClient;
  public gridFSBucketMap: Map<string, GridFSBucket> = new Map();

  public save(bucket: string, filename: string, content: Readable, options?: GridFSBucketOpenUploadStreamOptions): Promise<StorageObject> {
    return new Promise(async (resolve, reject) => {
      const gridFSBucket = this.getGridFSBucket(bucket) || await this.createGridFSBucket(bucket);

      const uploadStream = gridFSBucket.openUploadStream(filename, options);

      content.pipe(uploadStream);
      uploadStream.once('finish', () => { resolve(this.get(bucket, filename)); });
      uploadStream.once('error', (e: MongoError) => {
        if (e.name === 'MongoError' && e.code === 11000) {
          reject(new FileAlreadyExistsError(bucket, filename));
        }
        reject(e);
      });
    });
  }

  public delete(bucket: string, filename: string): Promise<void> {
    return new Promise(async(resolve, reject) => {
      const gridFSBucket = this.getGridFSBucket(bucket) || await this.createGridFSBucket(bucket);
      const object = await this.getByFilenameOrFail(gridFSBucket, filename);

      gridFSBucket.delete(object._id, err => err ? reject(err) : resolve());
    });
  }

  public async get(bucket: string, filename: string): Promise<StorageObject> {
    const gridFSBucket = this.getGridFSBucket(bucket) || await this.createGridFSBucket(bucket);

    const file = await this.getByFilenameOrFail(gridFSBucket, filename);
    return {
      contentLength: file.length,
      filename: file.filename,
      open: gridFSBucket.openDownloadStreamByName.bind(gridFSBucket, filename),
    };
  }

  protected async getByFilenameOrFail(gridFSBucket: GridFSBucket, filename: string): Promise<GridFSFile> {
    const [file] = await gridFSBucket.find({ filename }).limit(1).toArray();
    if (!file) {
      throw new StorageObjectNotFoundError(filename);
    }
    return file;
  }

  protected getGridFSBucket(bucket: string): GridFSBucket | undefined {
    let gridFSBucket = this.gridFSBucketMap.get(bucket);
    return gridFSBucket;
  }

  protected async createGridFSBucket(bucket: string): Promise<GridFSBucket> {
    const { gridFSBucketMap, configs, client } = this;
    const options = configs.gridFSOptions && configs.gridFSOptions[bucket];

    const gridFSBucket = new GridFSBucket(client.db(), { bucketName: bucket, ...options });
    await this.client.db().collection(`${bucket}.files`).createIndex({ filename: 1 }, { unique: true });
    gridFSBucketMap.set(bucket, gridFSBucket);
    return gridFSBucket;
  }
}
