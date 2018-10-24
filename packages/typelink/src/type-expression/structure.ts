import { GraphQLType } from 'graphql';

import { TypeExpression, TypeResolvingContext } from './TypeExpression';
import { Instantiator } from '../types';
import { GraphQLList, GraphQLNonNull } from 'graphql/type/definition';
import { TypeArg, type } from './coerce';


export class List extends TypeExpression {
  static of(inner: TypeArg | TypeExpression) {
    return new List(type(inner));
  }

  constructor(protected innerExp: TypeExpression) {
    super();
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
    return new NonNull(type(inner));
  }

  constructor(protected innerExp: TypeExpression) { super(); }

  getType(context: TypeResolvingContext): GraphQLType {
    return new GraphQLNonNull(this.innerExp.getType(context));
  }
  getInstantiator(context: TypeResolvingContext): Instantiator {
    return this.innerExp.getInstantiator(context);
  }
}
