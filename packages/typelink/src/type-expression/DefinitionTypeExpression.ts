import { GraphQLType } from 'graphql';

import { defaultInputFieldInstantiator, Instantiator } from '../types';
import { TypeResolvingContext, TypeExpression } from './TypeExpression';
import { Definition } from '../metadata';


/**
 * Contain an argument which can be resolved to GraphQLType instance.
 */
export class DefinitionTypeExpression {

  constructor(
    protected typeArg: string | Function,
    protected genericArgs: Array<TypeExpression>,
  ) { }

  public getType(context: TypeResolvingContext): GraphQLType {
    const def = this.resolveDefinition(context);
    if (!def) {
      throw new Error(`Cannot resolve type: ${this.typeArg}`);
    }
    const nextContext: TypeResolvingContext = {
      ...context,
      generic: this.genericArgs,
    };
    return def.getOrCreateTypeInstance(nextContext);
  }

  public getInstantiator(context: TypeResolvingContext): Instantiator {
    const def = this.resolveDefinition(context);
    return def ? def.buildInstantiator(context) : defaultInputFieldInstantiator;
  }

  protected resolveDefinition(context: TypeResolvingContext) {
    return context.storage.getDefinition(Definition, this.typeArg, context.kind);
  }
}
