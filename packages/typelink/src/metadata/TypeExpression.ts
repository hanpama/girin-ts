import { GraphQLType, isType } from 'graphql';

import { MetadataStorage, Definition, GenericArguments } from '.';
import { GenericParameter } from './generic';
import { defaultInputFieldInstantiator } from '../types';
import { DefinitionKind } from './Definition';


export type TypeArg = string | Function | GenericParameter | GraphQLType;

export function isTypeArg(maybeTypeArg: any): maybeTypeArg is TypeArg {
  return typeof maybeTypeArg === 'string'
    || maybeTypeArg instanceof Function
    || maybeTypeArg instanceof GenericParameter
    || isType(maybeTypeArg);
}

export interface ResolvedTypeExpression extends TypeExpression {
  typeArg: TypeArg;
}

/**
 * Contain an argument which can be resolved to GraphQLType instance.
 */
export class TypeExpression {

  constructor(
    public typeArg: TypeArg,
    public generic: GenericArguments,
  ) { }

  static coerce(typeArgOrExp: TypeExpression | TypeArg): TypeExpression {
    if (typeArgOrExp instanceof TypeExpression) {
      return typeArgOrExp;
    }
    else if (isTypeArg(typeArgOrExp)) {
      return new TypeExpression(typeArgOrExp, []);
    }
    throw new Error(`Given argument cannot be resolved to a type: ${typeArgOrExp}`);
  }

  protected definitionEntry: Definition<any> | null | undefined;

  protected getDefinition(storage: MetadataStorage, kind: DefinitionKind): Definition<any> {
    const { typeArg, generic } = this;
    if (isType(typeArg)) {
      throw new Error('GraphQLType object has no definition');
    }

    if (this.definitionEntry === undefined) {
      if (typeArg instanceof GenericParameter) {
        if (!generic) { throw new Error('Generic context is missing'); }

        const genericTypeExp = generic[typeArg.order];
        if (!genericTypeExp) { throw new Error('Generic type not provided'); }

        return genericTypeExp.getDefinition(storage, kind);
      }
      this.definitionEntry = storage.getDefinition(Definition, typeArg as string | Function, kind);
    }

    if (!this.definitionEntry) {
      throw new Error('Cannot find matched definition');
    }

    return this.definitionEntry;
  }

  public getType(storage: MetadataStorage, kind: DefinitionKind) {
    if (isType(this.typeArg)) { return this.typeArg; }
    const def = this.getDefinition(storage, kind);
    return def.getOrCreateTypeInstance(storage, this.generic);
  }

  public getInstantiator(storage: MetadataStorage, kind: DefinitionKind) {
    if (isType(this.typeArg)) { return defaultInputFieldInstantiator; }
    return this.getDefinition(storage, kind).buildInstantiator(storage);
  }
}
