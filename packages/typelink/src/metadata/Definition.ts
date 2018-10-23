import { GraphQLNamedType } from 'graphql';
import { MetadataStorage } from './MetadataStorage';
import { GenericContext } from './generic';
import { defaultInputFieldInstantiator, Instantiator } from '../types';


export type DefinitionKind = 'any' | 'input' | 'output';

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
  public get kind(): DefinitionKind { return 'any'; }

  public get definitionName() { return this.config.definitionName; }

  public constructor(config: TConfig) {
    this.config = config;
  }

  public typeName(generic: GenericContext | null): string  {
    const { definitionName } = this.config;
    return generic ? generic.typeName : definitionName;
  }

  public description(generic: GenericContext | null): string | undefined {
    return this.config.description;
  }

  protected graphqlType: Map<string | null, GraphQLNamedType> = new Map();

  public getOrCreateTypeInstance(storage: MetadataStorage, generic: GenericContext | null): GraphQLNamedType {
    if (generic) {
      generic.args.map(exp => exp.getType(storage, this.kind));
    }
    const genericKey = generic ? generic.typeName : null;
    let typeInstance = this.graphqlType.get(genericKey);
    if (!typeInstance) {
      typeInstance = this.buildTypeInstance(storage, generic);
      this.graphqlType.set(genericKey, typeInstance);
    }
    return typeInstance;
  }

  /**
   * Build GraphQLType instance from metadata.
   */
  public buildTypeInstance(storage: MetadataStorage, generic: GenericContext | null): GraphQLNamedType {
    throw new Error(`Should implement typeInstance getter in ${this.constructor.name}`);
  }

  public buildInstantiator(storage: MetadataStorage): Instantiator {
    return defaultInputFieldInstantiator;
  }
}
