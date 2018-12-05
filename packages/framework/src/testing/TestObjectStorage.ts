import { Readable, Duplex } from 'stream';
import { StorageObjectNotFoundError, ObjectStorage, StorageObject, FileAlreadyExistsError } from '../core/ObjectStorage';


// type Entry = { buffer: Buffer, filename: string };
type Bucket = Map<string, Buffer>;

export class TestObjectStorage extends ObjectStorage {
  buckets: Map<string, Bucket> = new Map();

  public async save(bucket: string, filename: string, content: Readable): Promise<StorageObject> {

    if (await this.getEntry(bucket, filename)) {
      throw new FileAlreadyExistsError(bucket, filename);
    }

    return new Promise((resolve, reject) => {

      const buffers: Buffer[] = [];

      if (!content.readable) {
        throw new Error('Content is not readable');
      }

      content.on('data', (data) => {
        buffers.push(data);
      });
      content.on('end', () => {
        this.getOrCreateBucket(bucket).set(filename, Buffer.concat(buffers));
        resolve(this.get(bucket, filename));
      });
      content.on('error', (err) => {
        reject(err);
      });
    });
  }

  protected getOrCreateBucket(bucket: string) {
    let bucketMap = this.buckets.get(bucket);
    if (!bucketMap) {
      bucketMap = new Map();
      this.buckets.set(bucket, bucketMap);
    }
    return bucketMap;
  }

  protected getEntry(bucket: string, filename: string): Buffer | undefined {
    const buffer = this.getOrCreateBucket(bucket).get(filename);
    return buffer;
  }

  public async delete(bucket: string, filename: string): Promise<void> {
    const buffer = this.getEntry(bucket, filename);
    if (!buffer) {
      throw new StorageObjectNotFoundError(filename);
    }
    this.getOrCreateBucket(bucket).delete(filename);
  }

  public async get(bucket: string, filename: string): Promise<StorageObject> {
    const buffer = this.getEntry(bucket, filename);
    if (!buffer) {
      throw new StorageObjectNotFoundError(filename);
    }
    const dupl = new Duplex();
    dupl.push(buffer);
    dupl.push(null);
    return {
      filename,
      contentLength: buffer.byteLength,
      open() { return dupl; }
    };
  }
}
