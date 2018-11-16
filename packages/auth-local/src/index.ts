import { LocalAuth, LocalAuthConfigs } from './module';
import { User } from './User';

export default LocalAuth;
export * from './decorators';
export * from './User';
export { LocalAuthConfigs };


export interface AuthContext<TUser extends User = User> {
  user: TUser;
}