import { GraphQLType } from 'graphql';

import { defaultInputFieldInstantiator, Instantiator } from '../types';
import { TypeExpression } from './TypeExpression';
import { Definition } from '../metadata/Definition';
import { TypeResolvingContext } from './types';


/**
 * Contain an argument which can be resolved to GraphQLType instance.
 */
export class DefinitionTypeExpression extends TypeExpression {

  constructor(protected typeArg: string | Function) { super(); }

  getTypeName(context: TypeResolvingContext): string {
    return this.resolveDefinition(context).definitionName;
  }

  public getType(context: TypeResolvingContext): GraphQLType {
    return this.resolveDefinition(context).getOrCreateTypeInstance(context);
  }

  public getInstantiator(context: TypeResolvingContext): Instantiator {
    let def;
    try { def = this.resolveDefinition(context); } catch {}
    return def ? def.buildInstantiator(context) : defaultInputFieldInstantiator;
  }

  protected resolveDefinition(context: TypeResolvingContext) {
    const def = context.storage.getDefinition(Definition, this.typeArg, context.kind);
    if (!def) {
      throw new Error(`Cannot resolve type: ${this.typeArg}`);
    }
    return def;
  }
}
