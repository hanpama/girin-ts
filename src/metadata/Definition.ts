import { GraphQLNamedType } from 'graphql';
import { defaultInputFieldInstantiator, Instantiator } from '../types';
import { TypeResolvingContext } from '../type-expression/types';
import { Reference } from './Reference';


export type DefinitionKind = 'any' | 'input' | 'output';

export interface DefinitionConfig {
  definitionClass: Function | null;
  definitionName: string;
  description?: string;
  directives?: any;
}

/**
 * Contain configs required to build named GraphQL types.
 * Guarantee its type instance only created once.
 */
export class Definition<TConfig extends DefinitionConfig = DefinitionConfig> {

  public readonly config: TConfig;
  public get kind(): DefinitionKind { return 'any'; }
  public get definitionClass() { return this.config.definitionClass; }
  public get definitionName() { return this.config.definitionName; }
  public get description(): string | undefined { return this.config.description; }

  public constructor(config: TConfig) {
    this.config = config;
  }

  protected graphqlType: GraphQLNamedType;

  public getOrCreateTypeInstance(context: TypeResolvingContext): GraphQLNamedType {
    if (!this.graphqlType) {
      this.graphqlType = this.buildTypeInstance(context);
    }
    return this.graphqlType;
  }

  public findReference<T extends Reference>(context: TypeResolvingContext, referenceClass: { new(v: any): T }) {
    const referenceByName = context.storage.findReference(referenceClass, this.definitionName);
    const referenceByClass = this.definitionClass
      ? context.storage.findReference(referenceClass, this.definitionClass)
      : [];
    return [...referenceByName, ...referenceByClass];
  }

  /**
   * Build GraphQLType instance from metadata.
   */
  public buildTypeInstance(context: TypeResolvingContext): GraphQLNamedType {
    throw new Error(`Should implement typeInstance getter in ${this.constructor.name}`);
  }

  public buildInstantiator(context: TypeResolvingContext): Instantiator {
    return defaultInputFieldInstantiator;
  }
}
