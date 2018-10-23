import { GraphQLType, GraphQLList, GraphQLNonNull, isType } from 'graphql';

import { TypeExpression, TypeArg } from './TypeExpression';
import { MetadataStorage } from './MetadataStorage';
import { defaultInputFieldInstantiator, Instantiator } from '../types';
import { DefinitionKind } from './Definition';


export abstract class Structure {
  static of<T extends Structure>(
    this: { new(...args: any[]): T },
    inner: Structure | TypeArg | TypeExpression | GraphQLType,
  ): T {
    return new this(inner instanceof Structure ? inner : TypeExpression.coerce(inner));
  }

  constructor(public inner: TypeExpression | Structure | GraphQLType) {}

  abstract getType(storage: MetadataStorage, kind: DefinitionKind): GraphQLType;
  abstract getInstantiator(storage: MetadataStorage, kind: DefinitionKind): Instantiator;
}

export class List extends Structure {
  public getType(storage: MetadataStorage, kind: DefinitionKind) {
    const innerType = isType(this.inner) ? this.inner : this.inner.getType(storage, kind);
    return new GraphQLList(innerType);
  }

  public getInstantiator(storage: MetadataStorage, kind: DefinitionKind) {
    const innerInstantiator = isType(this.inner)
      ? defaultInputFieldInstantiator
      : this.inner.getInstantiator(storage, kind);
    return (values: any[]) => values.map(value => innerInstantiator(value));
  }
}

export class NonNull extends Structure {
  public getType(storage: MetadataStorage, kind: DefinitionKind) {
    const innerType = isType(this.inner) ? this.inner : this.inner.getType(storage, kind);
    return new GraphQLNonNull(innerType);
  }

  public getInstantiator(storage: MetadataStorage, kind: DefinitionKind) {
    if (isType(this.inner)) { return defaultInputFieldInstantiator; }
    return this.inner.getInstantiator(storage, kind);
  }
}
