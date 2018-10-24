import { GraphQLType } from 'graphql';

import { TypeExpression, TypeResolvingContext } from '../type-expression';
import { Instantiator } from '../types';


export interface ReferenceConfig {
  targetType: TypeExpression;
  extendingTypeName?: string;
}

export type ReferenceKind = 'input' | 'output';

export abstract class Reference<TConfig extends ReferenceConfig = ReferenceConfig> {
  abstract kind: ReferenceKind;
  public constructor(protected config: TConfig) { }

  public definitionClass: Function;
  protected get targetType() { return this.config.targetType; }
  public get extendingTypeName() { return this.config.extendingTypeName; }

  public resolveType(context: TypeResolvingContext): GraphQLType {
    return this.targetType.getType({
      ...context,
      kind: this.kind
    });
  }

  public buildInstantiator(context: TypeResolvingContext): Instantiator {
    return this.targetType.getInstantiator({
      ...context,
      kind: this.kind
    });
  }
}
