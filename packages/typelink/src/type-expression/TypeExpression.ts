import { GraphQLType, isType } from 'graphql';

import { Definition } from '../definition/Definition';
import { MetadataStorage, DefinitionEntry } from '../metadata';
import { isLazy, Lazy, Instantiator } from '../types';
import { InputType } from '../definition';


export type TypeArg = GraphQLType | string | Function;

export interface ResolvedTypeExpression extends TypeExpression {
  typeArg: TypeArg;
}

export type TypeExpressionConstructorOptions = TypeArg | Lazy<TypeArg> | Lazy<TypeExpression>;

export type TypeExpressionKind = 'any' | 'input' | 'output';

/**
 * Contain an argument which can be resolved to GraphQLType instance.
 */
export class TypeExpression {

  constructor(
    public typeArg: TypeExpressionConstructorOptions,
    public kind: TypeExpressionKind = 'any',
  ) { }

  public resolveLazy(): ResolvedTypeExpression {
    const { typeArg } = this;
    let resolvedLazy = isLazy(typeArg) ? typeArg() : typeArg;
    if (resolvedLazy instanceof TypeExpression) {
      return resolvedLazy as ResolvedTypeExpression;
    }
    return new TypeExpression(resolvedLazy, this.kind) as ResolvedTypeExpression;
  }

  public getDefinitionEntry(storage: MetadataStorage): DefinitionEntry<any, any> {
    const { typeArg } = this.resolveLazy();
    return storage.getDefinition(Definition, typeArg as string | Function, this.kind);
  }

  public getTypeInstance(storage: MetadataStorage): GraphQLType {
    const exp = this.resolveLazy();

    if (isType(exp.typeArg)) {
      return exp.typeArg;
    }
    let { definitionClass, metadata } = exp.getDefinitionEntry(storage);
    return metadata.getOrCreateTypeInstance(storage, definitionClass);
  }

  public getInstantiator(storage: MetadataStorage): Instantiator {
    const exp = this.resolveLazy();

    if (isType(exp.typeArg)) {
      return defaultInputFieldInstantiator;
    }
    const { metadata, definitionClass } = exp.getDefinitionEntry(storage);
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
