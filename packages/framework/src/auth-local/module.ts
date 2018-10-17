import { Module } from '@girin/environment';
import { MongoDBModule, Model, field } from '@girin/mongodb';
import { defineType, gql } from '@girin/typelink';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';

import ServerModule from '../server';
import { ObjectID } from 'bson';
import commonPasswords from './common-passwords';


export class User extends Model {
  @field() hashedPassword: string;
  @field() username: string;
  @field() createdAt: Date;
}

export interface AuthLocalModuleConfigs<TUser extends User> {
  USER: { new(): TUser } & typeof User;
  JWT_SECRET_KEY: string;
  /**
   * Default: `true`
   *
   * When set to `true`, it adds `signUp` and `signIn` fields to mutation type
   */
  EXTENDS_SCHEMA?: boolean;
  PASSWORD_MIN_LENGTH?: number;
}

export interface AuthContext<TUser extends User> {
  user: TUser;
}

export class AuthLocalModule<TUser extends User> extends Module<void> {
  get label() { return 'auth'; }

  public configs: Required<AuthLocalModuleConfigs<TUser>>;

  constructor(configs: AuthLocalModuleConfigs<TUser>) {
    super();
    const serverModule = ServerModule.object();

    this.configs = Object.assign({
      PASSWORD_MIN_LENGTH: 8,
      EXTENDS_SCHEMA: true
    }, configs);

    const innerFn = serverModule.context;
    serverModule.context = async (prevContext: any) => {
      const context = await innerFn(prevContext);
      const token = context.req.headers.authorization;
      let user: any;
      if (token) {
        user = await this.decodeToken(token);
      }

      return { user, ...context };
    };

    if (this.configs.EXTENDS_SCHEMA) {
      defineType(gql`
        extend type Mutation {
          signIn(username: String!, password: String!): String!
          signUp(username: String!, password: String!): Boolean!
        }
      `)(this.constructor);
    }
  }
  public async bootstrap() {
    await MongoDBModule.bootstrap();
    await User.getManager().collection.createIndexes([
      { key: { username: 1 }, unique: true, sparse: true },
    ]);
  }

  public static async signUp(_source: any, args: { username: string, password: string }) {
    const mod = this.object();

    mod.validatePassword(args.password);

    const user = await mod.createUserInstance(args.username, args.password);
    await user.$save();

    return true;
  }

  public static async signIn(_source: any, args: { username: string, password: string }) {
    const mod = this.object();
    // console.log()
    const user = await mod.configs.USER.findOne({ username: args.username });
    if (!user) {
      throw new Error('Authentication Error');
    }
    const authenticated = await mod.authenticate(user, args.password);
    if (authenticated) {
      return mod.encodeToken(user);
    }
    throw new Error('Authentication Error');
  }

  public async createUserInstance(username: string, password: string): Promise<TUser> {
    const salt = await this.createSalt();
    const hashedPassword = await argon2.hash(password, { salt });
    const user = new this.configs.USER();
    user.hashedPassword = hashedPassword;
    user.username = username;
    user.createdAt = new Date();
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

  protected createSalt(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(128, (err, buf) => err ? reject(err) : resolve(buf));
    });
  }

  protected serializeUserInstance(user: TUser): { [key: string]: any } {
    return { id: String(user._id) };
  }

  protected async deserializeUserInstance(serialized: any): Promise<TUser> {
    const user = await this.configs.USER.getOne<TUser>(new ObjectID(serialized.id));
    if (!user) {
      throw new Error('Authentication Error');
    }
    return user;
  }

  public async encodeToken(user: TUser) {
    return jwt.sign(this.serializeUserInstance(user), this.configs.JWT_SECRET_KEY);
  }

  public async decodeToken(token: string): Promise<TUser> {
    const serialized = jwt.verify(token, this.configs.JWT_SECRET_KEY);
    const user = await this.deserializeUserInstance(serialized);
    return user;
  }

  public isValidUserInstance(user: TUser): boolean {
    return user instanceof this.configs.USER;
  }

  public validatePassword(password: string): void {
    if (password.length < this.configs.PASSWORD_MIN_LENGTH) {
      throw new Error('Password is too short');
    }
    if (commonPasswords.has(password)) {
      throw new Error('Password is too common');
    }
    if (password.match(/^\d+$/)) {
      throw new Error('Password should not be entirely numeric');
    }
  }
}
