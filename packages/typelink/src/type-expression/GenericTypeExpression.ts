import { GraphQLType } from 'graphql';

import { Instantiator } from '../types';
import { TypeResolvingContext, TypeExpression } from './TypeExpression';


/**
 * Contain an argument which can be resolved to GraphQLType instance.
 */
export class GenericTypeExpression extends TypeExpression {

  constructor(protected typeArg: GenericSymbol) { super(); }

  public getType(context: TypeResolvingContext): GraphQLType {
    return context.generic[this.typeArg.order].getType(context);
  }

  public getInstantiator(context: TypeResolvingContext): Instantiator {
    return context.generic[this.typeArg.order].getInstantiator(context);
  }
}

export class GenericSymbol {
  constructor(public order: number) {}
}

export const genericParameters = [
  new GenericSymbol(0), new GenericSymbol(1),
  new GenericSymbol(2), new GenericSymbol(3),
  new GenericSymbol(4), new GenericSymbol(5),
  new GenericSymbol(6), new GenericSymbol(7),
  new GenericSymbol(8), new GenericSymbol(9),
];
