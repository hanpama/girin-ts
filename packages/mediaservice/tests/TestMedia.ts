import { NeDBModel, nedbField } from '@girin/framework';
import { IMedia } from '../src';


export class TestMedia extends NeDBModel implements IMedia {
  @nedbField() filename: string;
  @nedbField() size: number;
  @nedbField() uploadedAt: Date;
  @nedbField() fileId: string;
}
