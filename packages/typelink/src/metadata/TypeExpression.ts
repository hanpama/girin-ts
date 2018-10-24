import { GraphQLType, isType, GraphQLNamedType, GraphQLList, GraphQLNonNull } from 'graphql';

import { MetadataStorage } from './MetadataStorage';
import { Definition, DefinitionKind } from './Definition';
import { defaultInputFieldInstantiator, Instantiator } from '../types';
import { formatObjectInfo } from '../utilities/formatObjectInfo';


export type TypeArg = string | Function | GenericParameter | GraphQLType;

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
      return new this(typeArgOrExp, []);
    }
    throw new Error(`Given argument cannot be resolved to a type: ${typeArgOrExp}`);
  }

  public getType(storage: MetadataStorage, kind: DefinitionKind): GraphQLType {
    const { typeArg, generic } = this;
    if (isType(typeArg)) {
      return typeArg;
    }
    const resolvedGenericTypes = generic.map(exp => exp.getType(storage, kind));

    if (typeArg instanceof GenericParameter) {
      return resolvedGenericTypes[typeArg.order];
    }
    if (typeArg === List) {
      return new GraphQLList(resolvedGenericTypes[0]);
    }
    if (typeArg === NonNull) {
      return new GraphQLNonNull(resolvedGenericTypes[0]);
    }

    const definition = storage.getDefinition(Definition, typeArg as string | Function, kind);
    if (!definition) {
      throw new Error(
        `Cannot get Definition of ${formatObjectInfo(typeArg)} from MetadataStorage`);
    }
    return definition.getOrCreateTypeInstance(storage, resolvedGenericTypes as GraphQLNamedType[]);
  }

  public getInstantiator(storage: MetadataStorage, kind: DefinitionKind): Instantiator {
    const { typeArg, generic } = this;

    if (isType(typeArg)) {
      return defaultInputFieldInstantiator;
    }

    const genericInstantiators = generic.map(exp => exp.getInstantiator(storage, kind));

    if (typeArg instanceof GenericParameter) {
      return genericInstantiators[typeArg.order];
    }
    if (typeArg === List) {
      return (values: any[]) => values.map(genericInstantiators[0]);
    }
    if (typeArg === NonNull) {
      return genericInstantiators[0];
    }

    const definition = storage.getDefinition(Definition, typeArg as string | Function, kind);
    return definition ? definition.buildInstantiator(storage) : defaultInputFieldInstantiator;
  }
}

export class List {
  static of(inner: TypeArg | TypeExpression) {
    return new TypeExpression(this, [TypeExpression.coerce(inner)]);
  }
}

export class NonNull {
  static of(inner: TypeArg | TypeExpression) {
    return new TypeExpression(this, [TypeExpression.coerce(inner)]);
  }
}

function isTypeArg(maybeTypeArg: any): maybeTypeArg is TypeArg {
  return typeof maybeTypeArg === 'string'
    || maybeTypeArg instanceof Function
    || maybeTypeArg instanceof GenericParameter
    || isType(maybeTypeArg);
}

export type GenericArguments = TypeExpression[];

export class GenericParameter {
  constructor(public order: number) {}
}

export const genericParameters = [
  new GenericParameter(0),
  new GenericParameter(1),
  new GenericParameter(2),
  new GenericParameter(3),
  new GenericParameter(4),
  new GenericParameter(5),
  new GenericParameter(6),
  new GenericParameter(7),
  new GenericParameter(8),
  new GenericParameter(9),
];
