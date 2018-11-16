export type UserConstructor<TUser extends User> = { new(): TUser };

export interface User {
  id: string;
  username: string;
  hashedPassword: string;
  createdAt: Date;
}
