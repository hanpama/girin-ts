import { Module } from '@girin/environment';
import ServerModule from '../core/server';
import { BaseUser } from '.';
import MongoDBModule from '../mongodb/module';


export interface AuthLocalModuleConfigs {
  AUTH_MODEL: typeof BaseUser,
  AUTH_PASSWORD_SALT: string;
  AUTH_JWT_SECRET_KEY: string;
}

export interface AuthLocalContext<TUser extends BaseUser = BaseUser> {
  user: TUser;
}

export default class AuthLocalModule extends Module<AuthLocalModuleConfigs, void> {
  PASSWORD_SALT: string;
  JWT_SECRET_KEY: string;

  async bootstrap() {
    const mongoDBModule = await this.environment.bootstrap(MongoDBModule);
    const collection = mongoDBModule.db.collection(this.configs.AUTH_MODEL.collectionName);
    await collection.createIndexes([
      { key: { username: 1 }, unique: true, sparse: true },
      { key: { 'email.address': 1 }, unique: true, sparse: true },
    ]);
  }
  configure() {
    this.PASSWORD_SALT = this.configs.AUTH_PASSWORD_SALT;
    this.JWT_SECRET_KEY = this.configs.AUTH_JWT_SECRET_KEY;

    const serverModule = this.environment.get(ServerModule);
    const innerFn = serverModule.context;
    serverModule.context = async (prevContext: any) => {
      const context = await innerFn(prevContext);
      const token = context.req.headers.authorization;
      const user = token ? await this.configs.AUTH_MODEL.fromToken(token) : null;
      return { user, ...context };
    }
  }
}
