export type MediaConstructor<TMedia extends IMedia> = { new(): TMedia };

export interface IMedia {
  id: any;
  filename: string;
  uploadedAt: Date;
  size: number;
  fileId: string;
}
