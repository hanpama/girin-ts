export type UserConstructor<TUser extends IUser> = { new(): TUser, prototype: TUser };

export interface IUser {
  id: string;
  createdAt: Date;
}

export interface AuthContext<TUser extends IUser = IUser> {
  user: TUser;
}