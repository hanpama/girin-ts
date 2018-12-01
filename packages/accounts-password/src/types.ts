import { IUser } from '@girin/auth';


export interface PasswordUser extends IUser {
  id: string;
  username: string;
  hashedPassword: string;
  createdAt: Date;
}
