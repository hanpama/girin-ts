import { GraphQLType } from 'graphql';

import { TypeExpression } from '../type-expression/TypeExpression';
import { Instantiator } from '../types';
import { MetadataStorage } from './MetadataStorage';


export interface ReferenceConfig {
  source: Function | string;
  target: TypeExpression;
}

export type ReferenceKind = 'input' | 'output';

export abstract class Reference<TConfig extends ReferenceConfig = ReferenceConfig> {
  protected abstract kind: ReferenceKind;
  public constructor(protected config: TConfig) { }

  public get source() { return this.config.source; }
  public get target() { return this.config.target; }
  // public get extendingTypeName() { return this.config.extendingTypeName; }

  public resolveType(storage: MetadataStorage): GraphQLType {
    return this.target.getType({ storage, kind: this.kind });
  }

  public buildInstantiator(storage: MetadataStorage): Instantiator {
    return this.target.getInstantiator({ storage, kind: this.kind });
  }
}
