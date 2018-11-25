import { User } from '@girin/accounts';

export interface PasswordUser extends User {
  id: string;
  username: string;
  hashedPassword: string;
  createdAt: Date;
}
