import { Module } from '@girin/environment';
import ServerModule from '../core/server';
import { BaseUser } from '.';


export interface AuthLocalModuleConfigs {
  AUTH_MODEL: typeof BaseUser,
  AUTH_PASSWORD_SALT: string;
  AUTH_JWT_SECRET_KEY: string;
}

export default class AuthLocalModule extends Module<AuthLocalModuleConfigs, void> {
  PASSWORD_SALT: string;
  JWT_SECRET_KEY: string;

  bootstrap() {}
  configure() {
    this.PASSWORD_SALT = this.configs.AUTH_PASSWORD_SALT;
    this.JWT_SECRET_KEY = this.configs.AUTH_JWT_SECRET_KEY;

    const serverModule = this.environment.get(ServerModule);
    const innerFn = serverModule.context;
    serverModule.context = (prevContext: any) => {
      const context = innerFn(prevContext);
      const token = context.req.headers.authorization;
      const user = token ? this.configs.AUTH_MODEL.decodeToken(token) : null;
      return { user, ...context };
    }
  }
}
