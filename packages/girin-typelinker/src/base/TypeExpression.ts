import { GraphQLType, isType } from "graphql";

import { Definition } from "./Definition";
import { MetadataStorage, DefinitionEntry } from "./MetadataStorage";
import { isLazy, Lazy, Instantiator } from "../types";
import { InputType } from "../metadata";


export type TypeArg = GraphQLType | string | Function;

export interface ResolvedTypeExpression extends TypeExpression {
  typeArg: TypeArg
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

  public resolveLazy(targetClass?: Function): ResolvedTypeExpression {
    const { typeArg } = this;
    let resolvedLazy = isLazy(typeArg) ? typeArg(targetClass) : typeArg;
    if (resolvedLazy instanceof TypeExpression) {
      return resolvedLazy as ResolvedTypeExpression;
    }
    return new TypeExpression(resolvedLazy, this.kind) as ResolvedTypeExpression;
  }

  public getDefinitionEntry(storage: MetadataStorage): DefinitionEntry {
    const { typeArg } = this.resolveLazy();
    return storage.getDefinition(Definition, typeArg as string | Function, this.kind);
  }

  public getTypeInstance(storage: MetadataStorage, targetClass?: Function): GraphQLType {
    const exp = this.resolveLazy(targetClass);

    if (isType(exp.typeArg)) {
      return exp.typeArg;
    }
    let definitionEntry = exp.getDefinitionEntry(storage);
    return definitionEntry.getOrCreateTypeInstance();
  }

  public getInstantiator(storage: MetadataStorage, targetClass?: Function): Instantiator {
    const exp = this.resolveLazy(targetClass);

    if (isType(exp.typeArg)) {
      return defaultInputFieldInstantiator;
    }
    const { metadata, linkedClass } = exp.getDefinitionEntry(storage);
    if (metadata instanceof InputType) {
      return metadata.buildInstantiator(storage, linkedClass);
    } else {
      return defaultInputFieldInstantiator;
    }
  }
}

function defaultInputFieldInstantiator(value: any) {
  return value;
}
