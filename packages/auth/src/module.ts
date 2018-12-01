import { Module } from '@girin/environment';
import { contextMap, ContextArguments, FrameworkDatastore } from '@girin/framework';
import * as jwt from 'jsonwebtoken';

import { IUser, UserConstructor } from './types';


export interface AuthConfigs<TUser extends IUser> {
  userConstructor: UserConstructor<TUser>;
  jwtSecretKey: string;
}

export class Auth<TUser extends IUser> extends Module {
  get label() { return 'auth'; }

  public onInit() {
    contextMap.set('user', this.populateUserInContext.bind(this));
  }

  constructor(public configs: AuthConfigs<TUser>) {
    super();
  }

  public async populateUserInContext({ req }: ContextArguments): Promise<TUser> {
    const token = req.headers.authorization;
    let user: any;
    if (token) {
      user = await this.decodeToken(token);
    }
    return user || null;
  }

  public isValidUserInstance(user: TUser): boolean {
    return (user instanceof this.configs.userConstructor) && (typeof user.id === 'string');
  }

  public async encodeToken(user: TUser): Promise<string> {
    return jwt.sign(this.serializeUserInstance(user), this.configs.jwtSecretKey);
  }

  public async decodeToken(token: string): Promise<TUser> {
    const serialized = jwt.verify(token, this.configs.jwtSecretKey);
    const user = await this.deserializeUserInstance(serialized);
    return user;
  }

  protected serializeUserInstance(user: TUser): { [key: string]: any } {
    const id = user.id;
    if (!id) { throw new AuthenticationError(); }
    return { id };
  }

  protected async deserializeUserInstance(serialized: any): Promise<TUser> {
    const id: string = serialized.id;
    if (!id) {
      throw new AuthenticationError();
    }
    const user = await this.getUser(id);

    if (!user) {
      throw new AuthenticationError();
    }
    return user;
  }

  public getUser(id: string): Promise<TUser | null> {
    return FrameworkDatastore.object().get(this.configs.userConstructor, id);
  }

  public saveUser(user: TUser) {
    return FrameworkDatastore.object().save(user);
  }

  public findUser(predicate: { [fieldName: string]: any }) {
    return FrameworkDatastore.object().find(this.configs.userConstructor, predicate);
  }

  /**
   * Create a user instance which is not saved to database yet.
   */
  public createUserInstance(): TUser {
    const user = new this.configs.userConstructor();
    user.createdAt = new Date();
    return user;
  }
}

export class AuthenticationError extends Error {
  constructor() {
    super();
    this.message = 'AuthenticationError';
  }
}
