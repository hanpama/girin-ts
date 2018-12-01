import { NeDBModel, field } from '@girin/framework';
import { IUser } from '../src';


export class TestUser extends NeDBModel implements IUser {
  id: string;
  @field() createdAt: Date;
}
