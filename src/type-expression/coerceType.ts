import { isType } from 'graphql';

import { TypeExpression } from './TypeExpression';
import { GraphQLTypeExpression } from './GraphQLTypeExpression';
import { DefinitionTypeExpression } from './DefinitionTypeExpression';
import { formatObjectInfo } from '../utilities/formatObjectInfo';
import { TypeArg } from './types';


/**
 * Coerce the given argument to a [TypeExpression]
 * @param arg
 */
export function coerceType(arg: TypeArg | TypeExpression): TypeExpression {
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
