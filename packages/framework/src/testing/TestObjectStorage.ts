import { Readable, Duplex } from 'stream';
import { StorageObjectNotFoundError, ObjectStorage, StorageObject } from '../core/ObjectStorage';


export class TestObjectStorage extends ObjectStorage {
  objectEntries: Map<string, { buffer: Buffer, filename: string } | null> = new Map();
  nextId: number = 1;

  public save(filename: string, content: Readable): Promise<StorageObject> {
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
        this.objectEntries.set(id, {
          buffer: Buffer.concat(buffers),
          filename,
        });
        resolve(this.get(id));
      });
      content.on('error', (err) => {
        reject(err);
      });
    });
  }

  protected getEntryOrFail(id: string) {
    const entry = this.objectEntries.get(id);
    if (!entry) {
      throw new StorageObjectNotFoundError(id);
    }
    return entry;
  }

  public async delete(id: string): Promise<void> {
    this.getEntryOrFail(id);
    this.objectEntries.delete(id);
  }

  public async get(id: string): Promise<StorageObject> {
    const { buffer, filename } = this.getEntryOrFail(id);
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
