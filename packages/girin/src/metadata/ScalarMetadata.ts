import { GraphQLScalarType } from "graphql";
import { Metadata, MetadataConfig } from "./Metadata";
import { MetadataStorage } from "../index";

import { DefinitionMetadata, DefinitionMetadataConfig } from "../base/DefinitionMetadata";


export interface ScalarMetadataConfig extends DefinitionMetadataConfig {
  typeInstance: GraphQLScalarType;
}

export class ScalarMetadata extends DefinitionMetadata<ScalarMetadataConfig> {
  public get typeName(): string {
    return this.config.typeInstance.name;
  }

  public get typeInstance() {
    return this.config.typeInstance;
  }
}
