import { Module } from '@girin/environment';
import { app, FrameworkDatastore, ObjectStorage, FileUpload } from '@girin/framework';
import { Request, Response } from 'express';


import { IMedia, MediaConstructor } from './types';
import { defineMedia } from './schema';
import { Readable } from 'stream';


export interface MediaServiceConfigs<TMedia extends IMedia> {
  /**
   * If provided, add an endpoint for media service
   */
  bucketName?: string;
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
      const storageObject = await ObjectStorage.object().get(this.bucketName, media.fileId);
      const downloadStream = storageObject.open();
      downloadStream.pipe(res);
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

    const media = new this.mediaConstructor();

    const { id, contentLength } = await ost.save(this.bucketName, filename, content);
    media.fileId = id;
    media.filename = filename;
    media.size = contentLength;
    media.uploadedAt = new Date();
    try {
      await persistence.save(media);
      return media;
    } catch (e) {
      await ost.delete(this.bucketName, media.fileId);
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

    await ost.delete(this.bucketName, media.fileId);
    await persistence.delete(this.mediaConstructor, id);
  }
}

export class MediaNotFoundError extends Error {
  constructor(mediaId: string) {
    super(`MediaNotFoundError: no media matched the given id ${mediaId}`);
  }
}
