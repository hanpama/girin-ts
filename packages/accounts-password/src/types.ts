import { User } from '@girin/auth';


export interface PasswordUser extends User {
  id: string;
  username: string;
  hashedPassword: string;
  createdAt: Date;
}
