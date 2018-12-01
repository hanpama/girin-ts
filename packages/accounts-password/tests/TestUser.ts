import { NeDBModel, nedbField } from '@girin/framework';
import { PasswordUser } from '../src';


export class TestUser extends NeDBModel implements PasswordUser {
  id: string;
  @nedbField() createdAt: Date;
  @nedbField() username: string;
  @nedbField() hashedPassword: string;
}
