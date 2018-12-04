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
  gridFSOptions?: {
    [bucket: string]: Pick<GridFSBucketOptions, 'chunkSizeBytes' | 'writeConcern' | 'ReadPreference'>
  };
}


export class GridFSObjectStorage extends ObjectStorage {

  constructor(public configs: GridFSObjectStorageConfigs) {
    super();
  }

  async onBootstrap() {
    this.client = new MongoClient(this.configs.url, this.configs.clientOptions);
    await this.client.connect();
    // this.gridFSBucket = new GridFSBucket(this.client.db(), this.configs.gridFSOptions);
  }

  async onDestroy() {
    await this.client.close();
  }

  public client: MongoClient;
  public gridFSBucketMap: Map<string, GridFSBucket> = new Map();

  public save(bucket: string, filename: string, content: Readable, options?: GridFSBucketOpenUploadStreamOptions): Promise<StorageObject> {
    return new Promise((resolve, reject) => {
      const gridFSBucket = this.getOrCreateGridFSBucket(bucket);
      const uploadStream = gridFSBucket.openUploadStream(filename, options);
      content.pipe(uploadStream);
      uploadStream.once('finish', () => { resolve(this.get(bucket, uploadStream.id.toString())); });
      uploadStream.once('error', (e) => { reject(e); });
    });
  }

  public delete(bucket: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const gridFSBucket = this.getOrCreateGridFSBucket(bucket);
      gridFSBucket.delete(new ObjectID(id), err => err ? reject(err) : resolve());
    });
  }

  public async get(bucket: string, id: string): Promise<StorageObject> {
    const gridFSBucket = this.getOrCreateGridFSBucket(bucket);

    const objectId = ObjectID.createFromHexString(id);
    const [entry] = await gridFSBucket.find({ _id: objectId }).limit(1).toArray();
    if (!entry) {
      throw new StorageObjectNotFoundError(id);
    }
    return {
      id,
      contentLength: entry.length,
      filename: entry.filename,
      open: gridFSBucket.openDownloadStream.bind(gridFSBucket, objectId),
    };
  }

  protected getOrCreateGridFSBucket(bucket: string) {
    const { gridFSBucketMap, configs, client } = this;

    let gridFSBucket = gridFSBucketMap.get(bucket);
    if (!gridFSBucket) {
      const options = configs.gridFSOptions && configs.gridFSOptions[bucket];

      gridFSBucket = new GridFSBucket(client.db(), { bucketName: bucket, ...options });
      gridFSBucketMap.set(bucket, gridFSBucket);
    }
    return gridFSBucket;
  }
}
