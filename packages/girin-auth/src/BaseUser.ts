import { Model, field } from 'girin-model';

import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';


export type BaseUserClass<T extends BaseUser> = typeof BaseUser & {
  new(source: any): T;
}

export class BaseUser extends Model {
  static get SECRET_KEY(): string {
    throw new Error('Not implemented');
  }
  static get SALT(): string {
    return '';
  }

  @field()
  protected hashedPassword: string;

  public static async createUser(source: { [fieldName: string]: any }, password: string) {
    const hashedPassword = await argon2.hash(password + this.SALT);
    const user = await this.insert({ hashedPassword, ...source });
    return user;
  }

  public authenticate(password: string) {
    return argon2.verify(this.hashedPassword, password + (this.constructor as typeof BaseUser).SALT);
  }

  public async changePassword(newPassword: string) {
    const hashedPassword = await argon2.hash(newPassword + (this.constructor as typeof BaseUser).SALT);
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
    return jwt.sign(rest, (this.constructor as typeof BaseUser).SECRET_KEY);
  }

  public static async decodeToken<T extends BaseUser>(this: BaseUserClass<T>, token: string): Promise<T> {
    const result: any = jwt.verify(token, this.SECRET_KEY);
    const user = await this.get(result._id);
    if (!user) {
      throw new Error('Authentication Error');
    }
    return user as T;
  }
}
