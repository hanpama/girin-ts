import { Readable, Duplex } from 'stream';
import { StorageObjectNotFoundError, ObjectStorage, StorageObject } from '../core/ObjectStorage';


type Entry = { buffer: Buffer, filename: string };
type Bucket = Map<string, Entry | null>;

export class TestObjectStorage extends ObjectStorage {
  buckets: Map<string, Bucket> = new Map();
  nextId: number = 1;

  public save(bucket: string, filename: string, content: Readable): Promise<StorageObject> {
    return new Promise((resolve, reject) => {
      const buffers: Buffer[] = [];

      if (!content.readable) {
        throw new Error('Content is not readable');
      }

      content.on('data', (data) => {
        buffers.push(data);
      });
      content.on('end', () => {
        const id = String(this.nextId);
        this.nextId += 1;
        this.getOrCreateBucket(bucket).set(id, {
          buffer: Buffer.concat(buffers),
          filename,
        });
        resolve(this.get(bucket, id));
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

  protected getEntryOrFail(bucket: string, id: string) {
    const entry = this.getOrCreateBucket(bucket).get(id);
    if (!entry) {
      throw new StorageObjectNotFoundError(id);
    }
    return entry;
  }

  public async delete(bucket: string, id: string): Promise<void> {
    this.getEntryOrFail(bucket, id);
    this.getOrCreateBucket(bucket).delete(id);
  }

  public async get(bucket: string, id: string): Promise<StorageObject> {
    const { buffer, filename } = this.getEntryOrFail(bucket, id);
    const dupl = new Duplex();
    dupl.push(buffer);
    dupl.push(null);
    return {
      id,
      filename,
      contentLength: buffer.byteLength,
      open() { return dupl; }
    };
  }
}
