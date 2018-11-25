import { Module } from '@girin/environment';

import * as argon2 from 'argon2';
import * as crypto from 'crypto';

import { Accounts } from '@girin/auth';
import commonPasswords from './common-passwords';
import { PasswordUser } from './types';


export interface LocalAuthConfigs {
  /**
   * Default: `true`
   *
   * When set to `true`, it adds `signUp` and `signIn` fields to mutation type
   */
  extendSchema?: boolean;
  passwordMinLength?: number;
}

export class LocalAuth<TUser extends PasswordUser> extends Module {
  get label() { return 'auth'; }

  public get passwordMinLength() {
    return this.configs.passwordMinLength || 8;
  }

  constructor(public configs: LocalAuthConfigs) {
    super();
  }

  public validatePassword(password: string): void {
    if (password.length < this.passwordMinLength) {
      throw new Error('Password is too short');
    }
    if (commonPasswords.has(password)) {
      throw new Error('Password is too common');
    }
    if (password.match(/^\d+$/)) {
      throw new Error('Password should not be entirely numeric');
    }
  }

  protected createSalt(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(128, (err, buf) => err ? reject(err) : resolve(buf));
    });
  }

  public async createUser(username: string, password: string): Promise<TUser> {
    const accounts: Accounts<TUser> = Accounts.object();

    this.validatePassword(password);

    const user = accounts.createUserInstance();
    await this.setPassword(user, password);
    user.username = username;

    await accounts.saveUser(user);

    return user;
  }

  public authenticate(user: TUser, password: string): Promise<boolean> {
    return argon2.verify(user.hashedPassword, password);
  }

  public async setPassword(user: TUser, password: string): Promise<TUser> {
    const salt = await this.createSalt();
    const hashedPassword = await argon2.hash(password, { salt });
    user.hashedPassword = hashedPassword;
    return user;
  }
}
