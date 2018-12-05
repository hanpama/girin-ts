import { NeDBModel, nedbField } from '@girin/framework';
import { IMedia, MediaService } from '../src';


export class TestMedia extends NeDBModel implements IMedia {
  @nedbField() filename: string;
  @nedbField() originalFilename: string;
  @nedbField() uuid: string;
  @nedbField() size: number;
  @nedbField() uploadedAt: Date;
  get url() {
    return MediaService.object().resolveMediaURL(this.id);
  }
}
