import { ObjectStorage, StorageObjectNotFoundError, StorageObject } from '@girin/framework';
import { Readable } from 'stream';
import { promisify } from 'util';

import * as fs from 'fs';
import * as path from 'path';
import { mkdirp } from 'fs-extra';
import uuidv1 from 'uuid/v1';


const readFilePromise = promisify(fs.readFile);
const writeFilePromise = promisify(fs.writeFile);
const unlinkPromise = promisify(fs.unlink);
const statPromise = promisify(fs.stat);

export interface FSObjectStorageConfigs {
  dir: string;
}

export class FSObjectStorage extends ObjectStorage {
  indexDir: string;
  contentDir: string;

  constructor(public configs: FSObjectStorageConfigs) {
    super();

    this.indexDir = path.join(this.configs.dir, 'index');
    this.contentDir = path.join(this.configs.dir, 'content');
  }

  async onBootstrap() {
    await mkdirp(this.indexDir);
    await mkdirp(this.contentDir);
  }

  public save(filename: string, content: Readable): Promise<StorageObject> {
    this.validateFilename(filename);

    return new Promise(async (resolve, reject) => {
      const fileId = uuidv1();

      let contentFilename = fileId;

      const { ext, name } = path.parse(filename);
      if (name) {
        contentFilename = `${name}-${contentFilename}`;
      } if (ext) {
        contentFilename = `${contentFilename}${ext}`;
      }
      const indexFile = path.join(this.indexDir, fileId);
      const contentFile = path.join(this.contentDir, contentFilename);

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
      writeStream.once('finish', () => { resolve(this.get(fileId)); });
      writeStream.once('error', async (e) => {
        try {
          await unlinkPromise(indexFile);
        } catch (e) {}
        reject(e);
      });
    });
  }

  protected async resolveIndex(validId: string): Promise<[string, string]> {
    try {
      const index = await readFilePromise(path.join(this.indexDir, validId));
      return JSON.parse(index.toString());
    } catch (e) {
      throw new StorageObjectNotFoundError(validId);
    }
  }

  protected validateId(id: string) {
    const isValidId = /^[\w\d-]+$/.test(id);
    if (!isValidId) { throw new Error('Invalid File ID'); }
  }

  protected validateFilename(filename: string) {
    if (/^\.\.?$/.test(filename)) { throw new Error('Invalid Filename'); }
  }

  public async delete(id: string): Promise<void> {
    this.validateId(id);

    const [filename, contentFilename] = await this.resolveIndex(id);

    const indexFile = path.join(this.indexDir, id);
    const contentFile = path.join(this.contentDir, contentFilename);

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

  public async get(id: string): Promise<StorageObject> {
    this.validateId(id);

    const [filename, contentFilename] = await this.resolveIndex(id);
    const contentFile = path.join(this.contentDir, contentFilename);

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
}
