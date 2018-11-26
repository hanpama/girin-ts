import { NeDBModel, field } from '@girin/framework';
import { User } from '../src';


export class TestUser extends NeDBModel implements User {
  id: string;
  @field() createdAt: Date;
}
