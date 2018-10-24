import { GraphQLType, isType } from 'graphql';

import { GenericSymbol, GenericTypeExpression } from './GenericTypeExpression';
import { TypeExpression } from './TypeExpression';
import { GraphQLTypeExpression } from './GraphQLTypeExpression';
import { DefinitionTypeExpression } from './DefinitionTypeExpression';


export type TypeArg = GenericSymbol | GraphQLType | Function | string;

/**
 * Coerce the given argument to a [TypeExpression]
 * @param arg
 */
export function type(arg: TypeArg | TypeExpression): TypeExpression {
  if (arg instanceof TypeExpression) {
    return arg;
  }
  if (arg instanceof GenericSymbol) {
    return new GenericTypeExpression(arg);
  }
  if (isType(arg)) {
    return new GraphQLTypeExpression(arg);
  }
  if (arg instanceof Function || typeof arg === 'string') {
    return new DefinitionTypeExpression(arg, []);
  }
  throw new Error(`Cannot coerce argument to type: ${arg}`);
}
