import { NeDBModel, field } from '@girin/framework';
import { PasswordUser } from '../src';


export class TestUser extends NeDBModel implements PasswordUser {
  id: string;
  @field() createdAt: Date;
  @field() username: string;
  @field() hashedPassword: string;
}
