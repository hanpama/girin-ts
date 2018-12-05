import { Readable } from 'stream';
import path from 'path';

import { Module } from '@girin/environment';
import { app, FrameworkDatastore, ObjectStorage, FileUpload } from '@girin/framework';
import { Request, Response } from 'express';
import uuidv1 from 'uuid/v1';

import { IMedia, MediaConstructor } from './types';
import { defineMedia } from './schema';

export interface MediaServiceConfigs<TMedia extends IMedia> {
  bucketName?: string;
  /**
   * If provided, add an endpoint for media service
   */
  endpoint?: string;
  extendSchema?: boolean;
  mediaConstructor: MediaConstructor<TMedia>;
}

export class MediaService<TMedia extends IMedia> extends Module {
  get label() { return 'media'; }

  get mediaConstructor() { return this.configs.mediaConstructor; }

  get bucketName() {
    return this.configs.bucketName || 'media';
  }

  constructor(public configs: MediaServiceConfigs<TMedia>) {
    super();
  }

  onInit() {
    if (this.configs.endpoint) {
      app.get(this.resolveMediaURL(':mediaId'), this.serveMedia.bind(this));
    }
    if (this.configs.extendSchema !== false) {
      defineMedia(this.mediaConstructor);
    }
  }

  async onBootstrap() {
    await ObjectStorage.bootstrap();
  }

  public async serveMedia(req: Request, res: Response) {
    const { mediaId } = req.params;
    if (!mediaId) {
      res.status(400);
      res.end();
      return;
    }

    try {
      const media = await this.getMedia(mediaId);
      const storageObject = await ObjectStorage.object().get(this.bucketName, media.filename);
      res.setHeader('ETag', media.uuid);
      if (req.method === 'GET') {
        const downloadStream = storageObject.open();
        downloadStream.pipe(res);
      } else {
        res.end();
      }
    } catch (e) {
      res.status(404);
      res.end();
    }
  }

  public resolveMediaURL(id: string): string {
    return `${this.configs.endpoint}/${id}`;
  }

  public async getMedia(id: string): Promise<TMedia> {
    const media = await FrameworkDatastore.object().get(this.mediaConstructor, id);
    if (!media) {
      throw new MediaNotFoundError(id);
    }
    return media;
  }

  async createMedia(filename: string, content: Readable) {
    const ost = ObjectStorage.object();
    const persistence = FrameworkDatastore.object();

    const mediaUUID = uuidv1();
    const { base, ext } = path.parse(filename);

    let uniqueFilename = mediaUUID;
    if (base) {
      uniqueFilename = base + '_' + uniqueFilename;
    }
    if (ext) {
      uniqueFilename = uniqueFilename + ext;
    }

    const { contentLength } = await ost.save(this.bucketName, uniqueFilename, content);

    const media = new this.mediaConstructor();
    media.originalFilename = filename;
    media.filename = uniqueFilename;
    media.size = contentLength;
    media.uploadedAt = new Date();
    media.uuid = mediaUUID;

    try {
      await persistence.save(media);
      return media;
    } catch (e) {
      await ost.delete(this.bucketName, media.filename);
      throw e;
    }
  }

  createMediaFromUpload(upload: FileUpload): Promise<TMedia> {
    return this.createMedia(upload.filename, upload.stream);
  }

  async deleteMedia(id: any) {
    const ost = ObjectStorage.object();
    const persistence = FrameworkDatastore.object();

    const media = await this.getMedia(id);

    await ost.delete(this.bucketName, media.filename);
    await persistence.delete(this.mediaConstructor, id);
  }
}

export class MediaNotFoundError extends Error {
  constructor(mediaId: string) {
    super(`MediaNotFoundError: no media matched the given id ${mediaId}`);
  }
}
