export type UserConstructor<TUser extends User> = { new(): TUser, prototype: TUser };

export interface User {
  id: string;
  createdAt: Date;
}

export interface AuthContext<TUser extends User = User> {
  user: TUser;
}