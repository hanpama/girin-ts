import { GraphQLType } from 'graphql';

import { TypeExpression } from './TypeExpression';
import { MetadataStorage } from './MetadataStorage';


export interface ReferenceConfig {
  targetType: TypeExpression;
  extendingTypeName?: string;
}

export abstract class Reference<TConfig extends ReferenceConfig = ReferenceConfig> {
  public constructor(protected config: TConfig) { }

  public definitionClass: Function;
  protected get targetType() { return this.config.targetType; }
  public get extendingTypeName() { return this.config.extendingTypeName; }

  public abstract resolveType(storage: MetadataStorage): GraphQLType;
}
