import { GraphQLNamedType } from 'graphql';
import { MetadataStorage } from './MetadataStorage';
import { defaultInputFieldInstantiator, Instantiator } from '../types';
import { PathMap } from '../utilities/PathMap';


export type DefinitionKind = 'any' | 'input' | 'output';

export interface DefinitionConfig {
  definitionName: string;
  description?: string;
  directives?: any;
}

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

  public typeName(genericTypes: GraphQLNamedType[]): string  {
    const { definitionName } = this.config;
    return genericTypes.map(t => t.name) + definitionName;
  }

  public description(genericTypes: GraphQLNamedType[]): string | undefined {
    return this.config.description;
  }

  protected graphqlType: PathMap<GraphQLNamedType, GraphQLNamedType> = new PathMap();

  public getOrCreateTypeInstance(storage: MetadataStorage, genericTypes: GraphQLNamedType[]): GraphQLNamedType {


    let typeInstance = this.graphqlType.get(genericTypes);
    if (!typeInstance) {
      typeInstance = this.buildTypeInstance(storage, genericTypes);
      this.graphqlType.set(genericTypes, typeInstance);
    }
    return typeInstance;
  }

  /**
   * Build GraphQLType instance from metadata.
   */
  public buildTypeInstance(storage: MetadataStorage, genericTypes: GraphQLNamedType[]): GraphQLNamedType {
    throw new Error(`Should implement typeInstance getter in ${this.constructor.name}`);
  }

  public buildInstantiator(storage: MetadataStorage): Instantiator {
    return defaultInputFieldInstantiator;
  }
}
