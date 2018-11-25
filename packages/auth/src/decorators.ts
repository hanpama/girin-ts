import { Auth } from './module';
import { AuthContext } from './types';


export type Resolver = (
  ((source: any, args: any, context: AuthContext<any>, info?: any) => any) |
  ((args: any, context: AuthContext<any>, info?: any) => any)
);

export type ResolverDecorator = (
  propertyOrClass: Object,
  fieldName: string,
  descriptor: TypedPropertyDescriptor<Resolver>,
) => void;

export function loginRequired(): ResolverDecorator {
  return function loginRequiredDecorator(
    prototypeOrClass: Object,
    _fieldName: string,
    descriptor: TypedPropertyDescriptor<Resolver>,
  ) {
    const maybeFunction = descriptor.value;
    if (typeof maybeFunction !== 'function') {
      throw new Error(`Should decorate function but got ${descriptor.value}`);
    }

    if (prototypeOrClass instanceof Function) { // is a class
      descriptor.value = function(source: any, args: any, context: AuthContext<any>, info: any) {
        if (!(context && Auth.object().isValidUserInstance(context.user))) {
          throw new Error('Authentication Error: login required');
        }
        return maybeFunction.apply(this, [source, args, context, info]);
      };
    } else { // is a prototype
      descriptor.value = function(args: any, context: AuthContext<any>, info: any) {
        if (!(context && Auth.object().isValidUserInstance(context.user))) {
          throw new Error('Authentication Error: login required');
        }
        return maybeFunction.apply(this, [args, context, info]);
      };
    }
  };
}
