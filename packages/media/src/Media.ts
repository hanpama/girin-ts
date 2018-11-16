export type MediaConstructor<TMedia extends Media> = { new(): TMedia };

export interface Media {
  id: any;
  filename: string;
  uploadedAt: Date;
  size: number;
  fileId: string;
}
