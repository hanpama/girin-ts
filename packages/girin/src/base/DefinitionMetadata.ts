import { GraphQLType } from "graphql";
import { MetadataConfig, Metadata } from "./Metadata";
import { DefinitionClass, defaultInstantiator, Instantiator } from "../types";


export interface DefinitionMetadataConfig extends MetadataConfig {
  definitionClass: DefinitionClass;
  typeName?: string;
  description?: string;
}


export class DefinitionMetadata<TConfig extends DefinitionMetadataConfig = DefinitionMetadataConfig> extends Metadata<TConfig> {

  public get typeName(): string  {
    const { definitionClass } = this;
    return this.config.typeName || (definitionClass as DefinitionClass).typeName || definitionClass.name;
  }

  public get description(): string | undefined {
    return this.config.description || (this.definitionClass as DefinitionClass).description;
  }

  public get typeInstance(): GraphQLType {
    throw new Error(`Should implement typeInstance getter in ${this.constructor.name}`);
  };

  public get instantiate(): Instantiator {
    return defaultInstantiator;
  }
}
