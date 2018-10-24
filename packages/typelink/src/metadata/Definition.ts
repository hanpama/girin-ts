import { GraphQLNamedType } from 'graphql';
import { defaultInputFieldInstantiator, Instantiator } from '../types';
import { PathMap } from '../utilities/PathMap';
import { TypeResolvingContext } from '../type-expression';


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

  public typeName(context: TypeResolvingContext): string  {
    const { definitionName } = this.config;

    const genericTypes = context.generic.map(exp => exp.getType(context)) as GraphQLNamedType[];

    return genericTypes.map(t => t.name) + definitionName;
  }

  public description(context: TypeResolvingContext): string | undefined {
    return this.config.description;
  }

  protected graphqlType: PathMap<GraphQLNamedType, GraphQLNamedType> = new PathMap();

  public getOrCreateTypeInstance(context: TypeResolvingContext): GraphQLNamedType {
    const { generic } = context;

    const genericTypes = generic.map(exp => exp.getType(context)) as GraphQLNamedType[];

    let typeInstance = this.graphqlType.get(genericTypes);
    if (!typeInstance) {
      typeInstance = this.buildTypeInstance(context);
      this.graphqlType.set(genericTypes, typeInstance);
    }
    return typeInstance;
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
