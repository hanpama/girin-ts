import { NeDBModel, field } from '@girin/framework';
import { Media } from '@girin/media';


export class TestMedia extends NeDBModel implements Media {
  @field() filename: string;
  @field() size: number;
  @field() uploadedAt: Date;
  @field() fileId: string;
}
