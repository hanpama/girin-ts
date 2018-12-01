import { NeDBModel, nedbField } from '@girin/framework';
import { IUser } from '../src';


export class TestUser extends NeDBModel implements IUser {
  id: string;
  @nedbField() createdAt: Date;
}
