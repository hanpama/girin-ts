export type ResolvedValue<T> = T | Promise<T>;
export type ResolvedList<T> = T[] | Promise<T[]> | Promise<T>[];

export interface ConcreteClass<T = any> {
  new(...args: any[]): T;
}

export type TypedClassDecorator<T extends Function> = (cls: T) => T | void;

export function isPromise<T = any>(value: T | Promise<T>): value is Promise<T> {
  return Boolean(value && typeof (value as Promise<T>).then === 'function');
}

export type Instantiator<TClass = any> = (value: { [key: string]: any }) => TClass;

export function defaultInputFieldInstantiator(value: any) {
  return value;
}
