export type ResolvedValue<T> = T | Promise<T>;
export type ResolvedList<T> = T[] | Promise<T[]> | Promise<T>[];

export interface ConcreteClass<T = any> {
  new(...args: any[]): T;
}

export type Instantiator<TClass = any> = (value: { [key: string]: any }) => TClass;

export function defaultInputFieldInstantiator(value: any) {
  return value;
}

export type Thunk<T> = () => T;
