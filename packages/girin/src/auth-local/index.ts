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

export class BaseUser extends Model {

  @field()
  protected hashedPassword: string;

  public static async createUserWithPassword(source: { [fieldName: string]: any }, password: string) {

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
    const { hashedPassword, ...rest } = this.$source;
    return jwt.sign(rest, getJWTSecretKey());
  }

  public static decodeToken<T extends BaseUser>(this: BaseUserClass<T>, token: string): T {
    const result: any = jwt.verify(token, getJWTSecretKey());
    console.log(result);
    const user = new this(result);
    user._id = new ObjectID(result._id);
    return user;
  }
}
