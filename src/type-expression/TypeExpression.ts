import { GraphQLType } from 'graphql';

import { MetadataStorage, DefinitionKind } from '../metadata';
import { Instantiator } from '../types';


export abstract class TypeExpression {
  abstract getTypeName(context: TypeResolvingContext): string;
  abstract getType(context: TypeResolvingContext): GraphQLType;
  abstract getInstantiator(context: TypeResolvingContext): Instantiator;
}

export interface TypeResolvingContext {
  storage: MetadataStorage;
  kind: DefinitionKind;
}
