import { GraphQLNamedType } from "graphql";
import { MetadataStorage } from "./MetadataStorage";
import { ASTParser } from "../sdl/ast";
import { getGlobalMetadataStorage } from "../global";


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
  public static define(astParser?: ASTParser, storage?: MetadataStorage) {
    const targetStorage: MetadataStorage = storage || getGlobalMetadataStorage();
    return (linkedClass: Function) => this.decorate(astParser, targetStorage, linkedClass);
  }

  protected static decorate(astParser: ASTParser | undefined, storage: MetadataStorage, linkedClass: Function) {
    astParser && astParser.fieldMetadataConfigs.forEach(field => {
      const maybeStaticResolver = (linkedClass as any)[field.defaultName];
      const resolver = maybeStaticResolver instanceof Function ? maybeStaticResolver : undefined;
      storage.registerFieldReference({ field, container: linkedClass, resolver });
    });

    astParser && astParser.inputFieldMetadataConfigs.forEach(config => {
      storage.registerInputFieldReference({ container: linkedClass, field: config })
    });
  }

  protected readonly config: TConfig
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

  /**
   * Build GraphQLType instance from metadata.
   */
  public buildTypeInstance(storage: MetadataStorage, targetClass: Function): GraphQLNamedType {
    throw new Error(`Should implement typeInstance getter in ${this.constructor.name}`);
  };
}
