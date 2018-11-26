import { Readable } from 'stream';

import {
  MongoClient,
  MongoClientOptions,
  GridFSBucketOptions,
  GridFSBucket,
  ObjectID,
  GridFSBucketOpenUploadStreamOptions,
} from 'mongodb';
import { ObjectStorage, StorageObjectNotFoundError, StorageObject } from '@girin/framework';


export interface GridFSObjectStorageConfigs {
  url: string;
  clientOptions?: MongoClientOptions;
  gridFSOptions?: GridFSBucketOptions;
}

export default class GridFSObjectStorage extends ObjectStorage {

  constructor(public configs: GridFSObjectStorageConfigs) {
    super();
  }

  async onBootstrap() {
    this.client = new MongoClient(this.configs.url, this.configs.clientOptions);
    await this.client.connect();
    this.bucket = new GridFSBucket(this.client.db(), this.configs.gridFSOptions);
  }

  async onDestroy() {
    await this.client.close();
  }

  public client: MongoClient;
  public bucket: GridFSBucket;

  public save(filename: string, content: Readable, options?: GridFSBucketOpenUploadStreamOptions): Promise<StorageObject> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.bucket.openUploadStream(filename, options);
      content.pipe(uploadStream);
      uploadStream.once('finish', () => { resolve(this.get(uploadStream.id.toString())); });
      uploadStream.once('error', (e) => { reject(e); });
    });
  }

  public delete(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.bucket.delete(new ObjectID(id), err => err ? reject(err) : resolve());
    });
  }

  public async get(id: string): Promise<StorageObject> {
    const { bucket } = this;

    const objectId = ObjectID.createFromHexString(id);
    const [entry] = await bucket.find({ _id: objectId }).limit(1).toArray();
    if (!entry) {
      throw new StorageObjectNotFoundError(id);
    }
    return {
      id,
      contentLength: entry.length,
      filename: entry.filename,
      open: bucket.openDownloadStream.bind(bucket, objectId),
    };
  }
}
