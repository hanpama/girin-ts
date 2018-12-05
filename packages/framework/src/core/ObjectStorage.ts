import { Module } from '@girin/environment';
import { Readable } from 'stream';


export interface StorageObject {
  /**
   * filename. should be unique in a bucket
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
  public abstract delete(bucket: string, filename: string): Promise<void>;
  public abstract get(bucket: string, filename: string): Promise<StorageObject>;
}

export class StorageObjectNotFoundError extends Error {
  constructor(filename: string) {
    super(`StorageObjectNotFoundError: no file matched with filename ${filename}`);
  }
}

export class FileAlreadyExistsError extends Error {
  constructor(bucket: string, filename: string) {
    super(`FileAlreadyExistsError: A file with the filename ${filename} already exists in ${bucket}`);
  }
}