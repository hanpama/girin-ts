export type MediaConstructor<TMedia extends IMedia> = { new(): TMedia };


export interface IMedia {
  id: any;
  filename: string;
  originalFilename: string;
  uploadedAt: Date;
  size: number;
  uuid: string;
  readonly url: string;
}
