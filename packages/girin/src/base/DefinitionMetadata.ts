import { GraphQLNamedType } from "graphql";
import { MetadataStorage } from "./MetadataStorage";
import { DefinitionClass } from "../types";
import { ASTParser } from "../sdl/ast";


export interface DefinitionMetadataConfig {
  typeName?: string;
  description?: string;
  directives?: any;
}

/**
 * Contain configs required to build named GraphQL types.
 * Guarantee its type instance only created once.
 */
export class DefinitionMetadata<TConfig extends DefinitionMetadataConfig = DefinitionMetadataConfig> {

  public static define(astParser: ASTParser, storage?: MetadataStorage) {
    const targetStorage: MetadataStorage = storage || require('../globalMetadataStorage').globalMetadataStorage;
    return (definitionClass: DefinitionClass) => this.decorate(astParser, targetStorage, definitionClass);
  }

  protected static decorate(astParser: ASTParser, storage: MetadataStorage, definitionClass: DefinitionClass) {
    throw new Error('Not implemented');
  }

  // public readonly definitionClass: DefinitionClass;
  protected readonly config: TConfig

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

  /**
   * Build GraphQLType instance from metadata.
   */
  public buildTypeInstance(storage: MetadataStorage, definitionClass: DefinitionClass): GraphQLNamedType {
    throw new Error(`Should implement typeInstance getter in ${this.constructor.name}`);
  };
}
