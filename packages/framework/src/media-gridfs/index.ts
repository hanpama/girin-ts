import { Module } from "@girin/environment";
import { MongoDBModule } from "@girin/mongodb";
import ServerModule from "../server";
import { GridFSBucketOptions, GridFSBucket, ObjectID, GridFSBucketOpenUploadStreamOptions } from "mongodb";
import { Request, Response } from "express";
import { Readable } from "stream";


export interface MediaGridFSModuleConfigs {
  ENDPOINT: string;
  GRIDFS_OPTIONS?: GridFSBucketOptions;
}

export default class MediaGridFSModule extends Module<void> {
  get label() { return 'MEDIA'; }

  constructor(public configs: MediaGridFSModuleConfigs) {
    super();

    const server = ServerModule.object();
    server.app.get(`/${configs.ENDPOINT}/:fileId`, this.serveMedia.bind(this));
  }

  async bootstrap() {
    const mongodb = await MongoDBModule.bootstrap()
    this.bucket = mongodb.createGridFSBucket(this.configs.GRIDFS_OPTIONS || {});
  }

  public bucket: GridFSBucket;

  public saveMedia(filename: string, mediaStream: Readable, options?: GridFSBucketOpenUploadStreamOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.bucket.openUploadStream(filename, options);
      mediaStream.pipe(uploadStream);
      const id = String(uploadStream.id);
      uploadStream.on('finish', () => { resolve(id); });
      uploadStream.on('error', (e) => { reject(e); });
    });
  }

  public serveMedia(req: Request, res: Response) {
    const { fileId } = req.params;
    if (!fileId) {
      res.status(404);
      res.end();
      return;
    }
    const fileObjectId = new ObjectID(fileId);
    const downloadStream = this.bucket.openDownloadStream(fileObjectId);
    downloadStream.pipe(res);
  }

  public getMediaURL(id: string) {
    return `${this.configs.ENDPOINT}/${id}`;
  }
}
