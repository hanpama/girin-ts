import { NeDBModel, field } from '@girin/framework/lib/test';
import { User } from '../src';


export class TestUser extends NeDBModel implements User {
  @field() createdAt: Date;
  @field() username: string;
  @field() hashedPassword: string;
}
