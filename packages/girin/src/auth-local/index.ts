import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';

import { Model, field } from '../mongodb';
import { ObjectID } from 'bson';
import AuthLocalModule from './module';
import { globalEnvironment } from '@girin/environment';


function getPasswordSalt() {
  return globalEnvironment.get(AuthLocalModule).PASSWORD_SALT;
}
function getJWTSecretKey() {
  return globalEnvironment.get(AuthLocalModule).JWT_SECRET_KEY;
}

export type BaseUserClass<T extends BaseUser> = typeof BaseUser & {
  new(source: any): T;
}

export class CreateUserInput {
  username: string;
  profile: any;
}

/**
 * Base class for user model
 */
export class BaseUser<TProfile = any> extends Model {

  @field() protected hashedPassword: string;

  @field() public username: string;
  @field() public createdAt: Date;
  // @field() public profile: TProfile;
  // @field() public emails: Array<{ address: string, verified: boolean }>;

  public static async createUserWithPassword(source: { username: string }, password: string) {
    const hashedPassword = await argon2.hash(password + getPasswordSalt());
    const user = await this.insert({ hashedPassword, ...source });
    return user;
  }

  public authenticate(password: string) {
    return argon2.verify(this.hashedPassword, password + getPasswordSalt());
  }

  public async changePassword(newPassword: string) {
    const hashedPassword = await argon2.hash(newPassword + getPasswordSalt());
    this.hashedPassword = hashedPassword;
    await this.$update({ $set: { hashedPassword } });

    return this;
  }

  public async encodeToken(password: string) {
    const authenticated = await this.authenticate(password);
    if (!authenticated) {
      throw new Error('Authentication Error');
    }
    return jwt.sign({ _id: this._id }, getJWTSecretKey());
  }

  public static async fromToken<T extends BaseUser>(this: BaseUserClass<T>, token: string): Promise<T> {
    const { _id }: any = jwt.verify(token, getJWTSecretKey());
    const user = await this.getOne(new ObjectID(_id));

    if (!user) {
      throw new Error('Authentication Error');
    }
    return user;
  }
}
