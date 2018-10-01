import { GraphQLNamedType } from "graphql";
import { MetadataStorage } from "../metadata";


export interface DefinitionConfig {
  typeName?: string;
  description?: string;
  directives?: any;
}

/**
 * Contain configs required to build named GraphQL types.
 * Guarantee its type instance only created once.
 */
export class Definition<TConfig extends DefinitionConfig = DefinitionConfig> {

  public readonly config: TConfig
  public isOutputType() { return false; }
  public isInputType() { return false; }

  public constructor(config: TConfig) {
    this.config = config;
  }

  public get typeName(): string  {
    const { typeName } = this.config;
    if (!typeName) { throw new Error('Should have typeName'); }
    return typeName
  }

  public get description(): string | undefined {
    return this.config.description;
  }

  protected graphqlType: GraphQLNamedType;

  public getOrCreateTypeInstance(storage: MetadataStorage, targetClass: Function) {
    if (!this.graphqlType) {
      this.graphqlType = this.buildTypeInstance(storage, targetClass);
    }
    return this.graphqlType;
  }

  /**
   * Build GraphQLType instance from metadata.
   */
  public buildTypeInstance(storage: MetadataStorage, targetClass: Function): GraphQLNamedType {
    throw new Error(`Should implement typeInstance getter in ${this.constructor.name}`);
  };
}
