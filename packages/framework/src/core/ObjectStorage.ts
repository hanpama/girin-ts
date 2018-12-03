import { Module } from '@girin/environment';
import { Readable } from 'stream';


export interface StorageObject {
  /**
   * ID of storage object
   */
  id: string;
  /**
   * filename
   */
  filename: string;
  /**
   * Content of object as a readable stream
   */
  open(): Readable;
  /**
   * Object size in bytes
   */
  contentLength: number;
}

export abstract class ObjectStorage extends Module {
  get label() { return 'ObjectStorage'; }

  public abstract save(bucket: string, filename: string, content: Readable): Promise<StorageObject>;
  public abstract delete(bucket: string, id: string): Promise<void>;
  public abstract get(bucket: string, id: string): Promise<StorageObject>;
}

export class StorageObjectNotFoundError extends Error {
  constructor(objectId: string) {
    super(`StorageObjectNotFoundError: no file matched with id ${objectId}`);
  }
}
