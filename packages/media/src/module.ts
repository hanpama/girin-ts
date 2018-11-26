import { Module } from '@girin/environment';
import { app, FrameworkDatastore, ObjectStorage } from '@girin/framework';
import { Request, Response } from 'express';

import { Media, MediaConstructor } from './Media';
import { FileUpload } from './types';
import { defineMedia } from './schema';


export interface MediaModuleConfigs<TMedia extends Media> {
  /**
   * If provided, add an endpoint for media service
   */
  endpoint?: string;
  extendSchema?: boolean;
  mediaConstructor: MediaConstructor<TMedia>;
}

export class MediaModule<TMedia extends Media> extends Module {
  get label() { return 'media'; }

  get mediaConstructor() { return this.configs.mediaConstructor; }

  constructor(public configs: MediaModuleConfigs<TMedia>) {
    super();
  }

  onInit() {
    if (this.configs.endpoint) {
      app.get(this.getMediaURL(':mediaId'), this.serveMedia.bind(this));
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
      const storageObject = await ObjectStorage.object().get(media.fileId);
      const downloadStream = storageObject.open();
      downloadStream.pipe(res);
    } catch (e) {
      res.status(404);
      res.end();
    }
  }

  public getMediaURL(mediaId: string): string {
    return `${this.configs.endpoint}/${mediaId}`;
  }

  public async getMedia(id: string): Promise<TMedia> {
    const media = await FrameworkDatastore.object().get(this.mediaConstructor, id);
    if (!media) {
      throw new MediaNotFoundError(id);
    }
    return media;
  }

  async createMedia(upload: FileUpload): Promise<TMedia> {
    const ost = ObjectStorage.object();
    const persistence = FrameworkDatastore.object();

    // const { filename, stream } = upload;
    const media = new this.mediaConstructor();

    const { id, contentLength, filename } = await ost.save(upload.filename, upload.stream);
    media.fileId = id;
    media.filename = filename;
    media.size = contentLength;
    media.uploadedAt = new Date();
    try {
      await persistence.save(media);
      return media;
    } catch (e) {
      await ost.delete(media.fileId);
      throw e;
    }
  }

  async deleteMedia(id: any) {
    const ost = ObjectStorage.object();
    const persistence = FrameworkDatastore.object();

    const media = await this.getMedia(id);

    await ost.delete(media.fileId);
    await persistence.delete(this.mediaConstructor, id);
  }
}

export class MediaNotFoundError extends Error {
  constructor(mediaId: string) {
    super(`MediaNotFoundError: no media matched the given id ${mediaId}`);
  }
}
