import { AuthContext } from '@girin/framework/auth-local';
import { User } from './models/User';

export type ForumContext = AuthContext<User>;
