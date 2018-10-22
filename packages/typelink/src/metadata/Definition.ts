import { GraphQLNamedType } from 'graphql';
import { MetadataStorage } from './MetadataStorage';
import { TypeExpression, GenericContext } from '../type-expression';


export interface DefinitionConfig {
  definitionName: string;
  description?: string;
  directives?: any;
}

// const leaf = Symbol();

/**
 * Contain configs required to build named GraphQL types.
 * Guarantee its type instance only created once.
 */
export class Definition<TConfig extends DefinitionConfig = DefinitionConfig> {
  public definitionClass: Function;

  public readonly config: TConfig;
  public isOutputType() { return false; }
  public isInputType() { return false; }

  public get definitionName() { return this.config.definitionName; }

  public constructor(config: TConfig) {
    this.config = config;
  }

  public typeName(generic?: GenericContext): string  {
    const { definitionName } = this.config;
    if (!definitionName) { throw new Error('Should have typeName'); }
    return definitionName;
  }

  public description(generic?: GenericContext): string | undefined {
    return this.config.description;
  }

  protected graphqlType: GraphQLNamedType;

  public getOrCreateTypeInstance(storage: MetadataStorage, targetClass: Function, generic?: GenericContext) {
    if (!this.graphqlType) {
      this.graphqlType = this.buildTypeInstance(storage, targetClass, generic);
    }
    return this.graphqlType;
  }

  /**
   * Build GraphQLType instance from metadata.
   */
  public buildTypeInstance(storage: MetadataStorage, targetClass: Function, generic?: GenericContext): GraphQLNamedType {
    throw new Error(`Should implement typeInstance getter in ${this.constructor.name}`);
  }
}
