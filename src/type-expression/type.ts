import { GraphQLType, isType } from 'graphql';

import { TypeExpression } from './TypeExpression';
import { GraphQLTypeExpression } from './GraphQLTypeExpression';
import { DefinitionTypeExpression } from './DefinitionTypeExpression';
import { formatObjectInfo } from '../utilities/formatObjectInfo';


export type TypeArg = GraphQLType | Function | string;

/**
 * Coerce the given argument to a [TypeExpression]
 * @param arg
 */
export function type(arg: TypeArg | TypeExpression): TypeExpression {
  if (arg instanceof TypeExpression) {
    return arg;
  }
  if (isType(arg)) {
    return new GraphQLTypeExpression(arg);
  }
  if (arg instanceof Function || typeof arg === 'string') {
    return new DefinitionTypeExpression(arg);
  }
  throw new Error(`Cannot coerce argument to type: ${formatObjectInfo(arg)}`);
}
