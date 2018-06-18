export interface DefinitionClass extends Function {
  typeName?: string;
  description?: string;
}

export type ResolvedValue<T> = T | Promise<T>;
export type ResolvedList<T> = T[] | Promise<T[]> | Promise<T>[];

export type Lazy<T> = (...args: any[]) => T;

export function isLazy<T>(arg: Lazy<T> | any): arg is Lazy<T> {
  return (arg instanceof Function) && (arg.name === '');
}

export function isSubClassOf(cls: Function, superClass: Function) {
  return cls.prototype instanceof superClass;
}

export interface ConcreteClass<T> {
  new(...args: any[]): T
}

export type TypedClassDecorator<T extends Function> = (cls: T) => T | void;

export function isPromise<T>(value: T | Promise<T>): value is Promise<T> {
  return Boolean(value && typeof (value as Promise<T>).then === 'function');
}
