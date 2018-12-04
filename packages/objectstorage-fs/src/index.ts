import { ObjectStorage, StorageObjectNotFoundError, StorageObject } from '@girin/framework';
import { Readable } from 'stream';
import { promisify } from 'util';

import * as fs from 'fs';
import * as path from 'path';
import uuidv1 from 'uuid/v1';
import { mkdirp } from 'fs-extra';


const readFilePromise = promisify(fs.readFile);
const writeFilePromise = promisify(fs.writeFile);
const unlinkPromise = promisify(fs.unlink);
const statPromise = promisify(fs.stat);

export interface FSObjectStorageConfigs {
  dir: string;
}

interface BucketContext {
  bucketDir: string;
  indexDir: string;
  contentDir: string;
}

export class FSObjectStorage extends ObjectStorage {
  buckets: Map<string, BucketContext> = new Map();

  constructor(public configs: FSObjectStorageConfigs) {
    super();
  }

  async onBootstrap() {
    await mkdirp(this.configs.dir);
  }

  getBucketContext(bucket: string): BucketContext | undefined {
    return this.buckets.get(bucket);
  }

  async createBucketContext(bucket: string): Promise<BucketContext> {
    const bucketDir = path.join(this.configs.dir, bucket);
    const indexDir = path.join(bucketDir, 'index');
    const contentDir = path.join(bucketDir, 'content');

    await mkdirp(bucketDir);
    await Promise.all([
      mkdirp(indexDir),
      mkdirp(contentDir),
    ]);

    const bucketContext = { indexDir, contentDir, bucketDir };
    this.buckets.set(bucket, bucketContext);
    return bucketContext;
  }

  public save(bucket: string, filename: string, content: Readable): Promise<StorageObject> {
    this.validateFilename(filename);

    return new Promise(async (resolve, reject) => {
      const fileId = uuidv1();

      let contentFilename = fileId;

      let { indexDir, contentDir } = this.getBucketContext(bucket) || await this.createBucketContext(bucket);

      const { ext, name } = path.parse(filename);
      if (name) {
        contentFilename = `${name}-${contentFilename}`;
      } if (ext) {
        contentFilename = `${contentFilename}${ext}`;
      }
      const indexFile = path.join(indexDir, fileId);
      const contentFile = path.join(contentDir, contentFilename);

      try {
        await writeFilePromise(indexFile, JSON.stringify([
          filename,
          contentFilename,
        ]));
      } catch (e) {
        throw new Error(`Failed to create index file: ${e}`);
      }

      const writeStream = fs.createWriteStream(contentFile);
      content.pipe(writeStream);
      writeStream.once('finish', () => { resolve(this.get(bucket, fileId)); });
      writeStream.once('error', async (e) => {
        try {
          await unlinkPromise(indexFile);
        } catch (e) {}
        reject(e);
      });
    });
  }

  public async delete(bucket: string, id: string): Promise<void> {
    let { indexDir, contentDir } = this.getBucketContext(bucket) || await this.createBucketContext(bucket);

    const [filename, contentFilename] = await this.resolveIndex(indexDir, id);

    const indexFile = path.join(indexDir, id);
    const contentFile = path.join(contentDir, contentFilename);

    try {
      await unlinkPromise(indexFile);
    } catch (e) {
      throw new Error(`Cannot delete index file: ${e}`);
    }
    try {
      await unlinkPromise(contentFile);
    } catch (e) {
      await writeFilePromise(indexFile, JSON.stringify([filename, contentFilename]));
      throw e;
    }
  }

  public async get(bucket: string, id: string): Promise<StorageObject> {

    let { indexDir, contentDir } = this.getBucketContext(bucket) || await this.createBucketContext(bucket);

    const [filename, contentFilename] = await this.resolveIndex(indexDir, id);
    const contentFile = path.join(contentDir, contentFilename);

    try {
      const { size } = await statPromise(contentFile);
      return {
        id,
        filename,
        open: fs.createReadStream.bind(undefined, contentFile),
        contentLength: size,
      };
    } catch (e) {
      throw new StorageObjectNotFoundError(id);
    }
  }

  protected async resolveIndex(indexDir: string, id: string): Promise<[string, string]> {
    this.validateId(id);
    try {
      const index = await readFilePromise(path.join(indexDir, id));
      return JSON.parse(index.toString());
    } catch (e) {
      throw new StorageObjectNotFoundError(id);
    }
  }

  protected validateId(id: string) {
    const isValidId = /^[\w\d-]+$/.test(id);
    if (!isValidId) { throw new Error('Invalid File ID'); }
  }

  protected validateFilename(filename: string) {
    if (/^\.\.?$/.test(filename)) { throw new Error('Invalid Filename'); }
  }
}
