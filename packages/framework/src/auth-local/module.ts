// import { Module } from '@girin/environment';
// import * as jwt from 'jsonwebtoken';
// import * as crypto from 'crypto';
// import * as argon2 from 'argon2';
// import ServerModule from '../server';


// export interface BaseUser {
//   id: string | number;
//   createdAt: Date;
//   hashedPassword: string;
// }

// export interface AuthLocalModuleConfigs<TUser extends BaseUser> {
//   AUTH_MODEL: { new(): TUser },
//   AUTH_JWT_SECRET_KEY: string;
// }

// export interface AuthLocalContext<TUser extends BaseUser> {
//   user: TUser;
// }


// export abstract class AuthBaseMoule<TUser extends BaseUser> extends Module<void> {
//   constructor(public configs: AuthLocalModuleConfigs<TUser>) {
//     super();
//     const serverModule = ServerModule.object();

//     const innerFn = serverModule.context;
//     serverModule.context = async (prevContext: any) => {
//       const context = await innerFn(prevContext);
//       const token = context.req.headers.authorization;
//       let user: any;
//       try {
//         user = await this.decodeToken(token);
//       } catch(e) {
//         user = null;
//       }
//       return { user, ...context };
//     }
//   }

//   public abstract getUserById(string: string): TUser | Promise<TUser>;

//   public async createUserWithPassword(username: string, password: string): Promise<TUser> {
//     const salt = await this.createSalt();
//     const hashedPassword = await argon2.hash(password, { salt });
//     const user = this.createUser();
//     user.createdAt = new Date();
//     user.hashedPassword = hashedPassword;
//     return user;
//   }

//   public authenticate(user: TUser, password: string): Promise<boolean> {
//     return argon2.verify(user.hashedPassword, password);
//   }

//   public async changePassword(user: TUser, newPassword: string): Promise<TUser> {
//     const salt = await this.createSalt();
//     const hashedPassword = await argon2.hash(newPassword, { salt });
//     user.hashedPassword = hashedPassword;
//     return user;
//   }

//   public async encodeToken(user: TUser, password: string) {
//     const authenticated = await this.authenticate(user, password);
//     if (!authenticated) {
//       throw new Error('Authentication Error');
//     }
//     return jwt.sign({ _id: this._id }, this.configs.AUTH_JWT_SECRET_KEY);
//   }

//   public async decodeToken(token: string): Promise<any> {
//     const { _id }: any = jwt.verify(token, this.configs.AUTH_JWT_SECRET_KEY);

//     if (!user) {
//       throw new Error('Authentication Error');
//     }
//     return user;
//   }

//   protected createSalt(): Promise<Buffer> {
//     return new Promise((resolve, reject) => {
//       crypto.randomBytes(128, (err, buf) => err? reject(err) : resolve(buf))
//     });
//   }

//   protected createUser(): TUser {
//     return new this.configs.AUTH_MODEL();
//   }

// }
