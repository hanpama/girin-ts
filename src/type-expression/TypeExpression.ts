import { GraphQLType } from 'graphql';
import { Instantiator } from '../types';
import { TypeResolvingContext } from './types';


export abstract class TypeExpression {
  abstract getTypeName(context: TypeResolvingContext): string;
  abstract getType(context: TypeResolvingContext): GraphQLType;
  abstract getInstantiator(context: TypeResolvingContext): Instantiator;
}
