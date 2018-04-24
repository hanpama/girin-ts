import { GraphQLScalarType } from "graphql";

import { DefinitionMetadata, DefinitionMetadataConfig } from "../base/DefinitionMetadata";


export interface ScalarMetadataConfig extends DefinitionMetadataConfig {
  typeInstance: GraphQLScalarType;
}

/**
 * Metadata type for ScalarType
 */
export class ScalarMetadata<T extends ScalarMetadataConfig = ScalarMetadataConfig> extends DefinitionMetadata<T> {
  public get typeName(): string {
    return this.config.typeInstance.name;
  }

  public get typeInstance() {
    return this.config.typeInstance;
  }
}
