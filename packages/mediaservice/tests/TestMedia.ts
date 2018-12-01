import { NeDBModel, field } from '@girin/framework';
import { IMedia } from '../src';


export class TestMedia extends NeDBModel implements IMedia {
  @field() filename: string;
  @field() size: number;
  @field() uploadedAt: Date;
  @field() fileId: string;
}
