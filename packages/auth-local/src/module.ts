import { Module } from '@girin/environment';
import { FrameworkDatastore, contextMap } from '@girin/framework';

import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

import { User, UserConstructor } from './User';
import { loadExtensions } from './schema';
import commonPasswords from './common-passwords';


export interface LocalAuthConfigs<TUser extends User> {
  userConstructor: UserConstructor<TUser>;
  jwtSecretKey: string;
  /**
   * Default: `true`
   *
   * When set to `true`, it adds `signUp` and `signIn` fields to mutation type
   */
  extendSchema?: boolean;
  passwordMinLength?: number;
}

export class LocalAuth<TUser extends User> extends Module {
  get label() { return 'auth'; }

  public get userConstructor() {
    return this.configs.userConstructor;
  }

  public get passwordMinLength() {
    return this.configs.passwordMinLength || 8;
  }

  constructor(public configs: LocalAuthConfigs<TUser>) {
    super();
  }

  public onLoad() {
    contextMap.set('user', async ({ req }) => {
      const token = req.headers.authorization;
      let user: any;
      if (token) {
        user = await this.decodeToken(token);
      }
      return user || null;
    });

    if (this.configs.extendSchema !== false) {
      loadExtensions();
    }
  }


  public persistUserInstance(user: TUser): Promise<any> {
    return FrameworkDatastore.object().save(user);
  }

  public async getUserInstance(username: string): Promise<TUser | null> {
    const user = await FrameworkDatastore.object().find(this.userConstructor, { username }) as TUser;
    return user || null;
  }

  protected serializeUserInstance(user: TUser): { [key: string]: any } {
    const username = user.username;
    if (!username) { throw new Error(''); }
    return { username };
  }

  protected async deserializeUserInstance(serialized: any): Promise<TUser> {
    const username: string = serialized.username;
    if (!username) { throw new Error(''); }
    const user = await this.getUserInstance(username);

    if (!user) {
      throw new Error('Authentication Error');
    }
    return user;
  }

  public async encodeToken(user: TUser) {
    return jwt.sign(this.serializeUserInstance(user), this.configs.jwtSecretKey);
  }

  public async decodeToken(token: string): Promise<TUser> {
    const serialized = jwt.verify(token, this.configs.jwtSecretKey);
    const user = await this.deserializeUserInstance(serialized);
    return user;
  }

  public isValidUserInstance(user: TUser): boolean {
    return user instanceof this.userConstructor;
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
    this.validatePassword(password);
    const user = new this.userConstructor();
    await this.setPassword(user, password);

    user.username = username;
    user.createdAt = new Date();
    await this.persistUserInstance(user);

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
