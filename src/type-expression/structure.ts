import { GraphQLType } from 'graphql';

import { TypeExpression } from './TypeExpression';
import { Instantiator } from '../types';
import { GraphQLList, GraphQLNonNull } from 'graphql/type/definition';
import { coerceType } from './coerceType';
import { TypeResolvingContext, TypeArg } from './types';


export class List extends TypeExpression {
  static of(inner: TypeArg | TypeExpression) {
    return new List(coerceType(inner));
  }

  constructor(protected innerExp: TypeExpression) {
    super();
  }

  getTypeName(): string {
    throw new Error(`Cannot resolve name: List is not a GraphQLNamedType`);
  }

  getType(context: TypeResolvingContext): GraphQLType {
    return new GraphQLList(this.innerExp.getType(context));
  }
  getInstantiator(context: TypeResolvingContext): Instantiator {
    const innerInstantiator = this.innerExp.getInstantiator(context);
    return (values: any[]) => values.map(innerInstantiator);
  }
}

export class NonNull extends TypeExpression {
  static of(inner: TypeArg | TypeExpression) {
    return new NonNull(coerceType(inner));
  }

  constructor(protected innerExp: TypeExpression) { super(); }

  getTypeName(): string {
    throw new Error(`Cannot resolve name: NonNull is not a GraphQLNamedType`);
  }
  getType(context: TypeResolvingContext): GraphQLType {
    return new GraphQLNonNull(this.innerExp.getType(context));
  }
  getInstantiator(context: TypeResolvingContext): Instantiator {
    return this.innerExp.getInstantiator(context);
  }
}
