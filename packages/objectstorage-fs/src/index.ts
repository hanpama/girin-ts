import { ObjectStorage, StorageObjectNotFoundError, StorageObject, FileAlreadyExistsError } from '@girin/framework';
import { Readable } from 'stream';
import { promisify } from 'util';

import * as fs from 'fs';
import * as path from 'path';
import { mkdirp } from 'fs-extra';


const unlinkPromise = promisify(fs.unlink);
const statPromise = promisify(fs.stat);

export interface FSObjectStorageConfigs {
  dir: string;
}

export class FSObjectStorage extends ObjectStorage {
  buckets: Map<string, string> = new Map();

  constructor(public configs: FSObjectStorageConfigs) {
    super();
  }

  async onBootstrap() {
    await mkdirp(this.configs.dir);
  }

  getBucketDirectory(bucket: string): string | undefined {
    return this.buckets.get(bucket);
  }

  async createBucketDirectory(bucket: string): Promise<string> {
    const bucketDir = path.join(this.configs.dir, bucket);

    await mkdirp(bucketDir);

    this.buckets.set(bucket, bucketDir);
    return bucketDir;
  }

  public async save(bucket: string, filename: string, content: Readable): Promise<StorageObject> {
    this.validateFilename(filename);

    let bucketDir = this.getBucketDirectory(bucket) || await this.createBucketDirectory(bucket);

    return new Promise((resolve, reject) => {
      const contentFilePath = path.join(bucketDir, filename);

      const writeStream = fs.createWriteStream(contentFilePath, { flags: 'wx' });
      content.pipe(writeStream);
      writeStream.once('finish', () => { resolve(this.get(bucket, filename)); });
      writeStream.once('error', (err) => {
        if (err.code === 'EEXIST') {
          reject(new FileAlreadyExistsError(bucket, filename));
        } else {
          reject(err);
        }
      });
    });
  }

  public async delete(bucket: string, filename: string): Promise<void> {
    this.validateFilename(filename);

    const bucketDir = this.getBucketDirectory(bucket) || await this.createBucketDirectory(bucket);
    const contentFile = path.join(bucketDir, filename);
    await unlinkPromise(contentFile);
  }

  public async get(bucket: string, filename: string): Promise<StorageObject> {
    this.validateFilename(filename);

    const bucketDir = this.getBucketDirectory(bucket) || await this.createBucketDirectory(bucket);
    const contentFilePath = path.join(bucketDir, filename);

    try {
      const { size } = await statPromise(contentFilePath);
      return {
        filename,
        open: () => fs.createReadStream(contentFilePath),
        contentLength: size,
      };
    } catch (e) {
      throw new StorageObjectNotFoundError(filename);
    }
  }

  protected validateFilename(filename: string) {
    const { root, dir } = path.parse(filename);
    if (root !== '' || dir !== '') {
      throw new Error('Invalid Filename');
    }
  }
}
