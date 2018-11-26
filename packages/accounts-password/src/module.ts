import { Module } from '@girin/environment';
import { Auth } from '@girin/auth';

import * as argon2 from 'argon2';
import * as crypto from 'crypto';

import commonPasswords from './common-passwords';
import { PasswordUser } from './types';
import { loadExtensions } from './schema';


export interface AccountsPasswordConfigs {
  /**
   * Default: `true`
   *
   * When set to `true`, it adds `signUp` and `signIn` fields to mutation type
   */
  extendSchema?: boolean;
  passwordMinLength?: number;
}

export class AccountsPassword<TUser extends PasswordUser> extends Module {
  get label() { return 'accounts-password'; }

  public get passwordMinLength() {
    return this.configs.passwordMinLength || 8;
  }

  constructor(public configs: AccountsPasswordConfigs) {
    super();
  }

  onInit() {
    if (this.configs.extendSchema !== false) {
      loadExtensions();
    }
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

  protected async hashPassword(password: string) {
    const salt = await this.createSalt();
    return argon2.hash(password, { salt });
  }

  public authenticate(user: TUser, password: string): Promise<boolean> {
    return argon2.verify(user.hashedPassword, password);
  }

  public async setPassword(user: TUser, password: string): Promise<TUser> {
    user.hashedPassword = await this.hashPassword(password);
    await Auth.object().saveUser(user);
    return user;
  }

  public async createPasswordUser(username: string, password: string) {
    const auth: Auth<TUser> = Auth.object();

    this.validatePassword(password);

    const user = auth.createUserInstance();
    user.username = username;
    user.hashedPassword = await this.hashPassword(password);

    await auth.saveUser(user);
    return user;
  }

  public async signUp(username: string, password: string): Promise<string> {
    const user = await this.createPasswordUser(username, password);
    return Auth.object().encodeToken(user);
  }

  public async signIn(username: string, password: string): Promise<string> {
    const auth: Auth<TUser> = Auth.object();

    const user = await auth.findUser({ username });
    if (!user) {
      throw new Error('Authentication Error');
    }

    const authenticated = await this.authenticate(user, password);
    if (authenticated) {
      return auth.encodeToken(user);
    }
    throw new Error('Authentication Error');
  }
}
