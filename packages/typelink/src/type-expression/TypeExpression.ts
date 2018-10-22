import { GraphQLType, isType } from 'graphql';

import { MetadataStorage, Definition } from '../metadata';
import { Instantiator } from '../types';
import { InputType } from '../definition';


export type TypeArg = GraphQLType | string | Function;

export interface ResolvedTypeExpression extends TypeExpression {
  typeArg: TypeArg;
}

export type TypeExpressionConstructorOptions = TypeArg;

export type TypeExpressionKind = 'any' | 'input' | 'output';

/**
 * Contain an argument which can be resolved to GraphQLType instance.
 */
export class TypeExpression {

  constructor(
    public typeArg: TypeExpressionConstructorOptions,
    public kind: TypeExpressionKind = 'any',
    public generic?: GenericContext,
  ) { }

  public getDefinitionEntry(storage: MetadataStorage): Definition<any> {
    return storage.getDefinition(Definition, this.typeArg as string | Function, this.kind);
  }

  public getTypeInstance(storage: MetadataStorage): GraphQLType {

    if (isType(this.typeArg)) { return this.typeArg; }

    const metadata = this.getDefinitionEntry(storage);
    return metadata.getOrCreateTypeInstance(storage, metadata.definitionClass, this.generic);
  }

  public getInstantiator(storage: MetadataStorage): Instantiator {
    if (isType(this.typeArg)) {
      return defaultInputFieldInstantiator;
    }
    const { metadata, definitionClass } = this.getDefinitionEntry(storage);
    if (metadata instanceof InputType) {
      return metadata.buildInstantiator(storage, definitionClass);
    } else {
      return defaultInputFieldInstantiator;
    }
  }
}

function defaultInputFieldInstantiator(value: any) {
  return value;
}

export interface GenericContext {
  typeName: string;
  args: TypeExpression[];
}
