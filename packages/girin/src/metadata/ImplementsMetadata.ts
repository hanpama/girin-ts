import { GraphQLInterfaceType } from "graphql";

import { Metadata, MetadataConfig } from "./Metadata";
import { InterfaceTypeMetadata } from "./InterfaceTypeMetadata";

export interface ImplementsMetadataConfig extends MetadataConfig {
  definitionClass: Function;
  targetDefinitionClass: Function;
}

export interface ImplementsMetadataBuild {
  targetMetadata: InterfaceTypeMetadata;
  targetTypeInstance: GraphQLInterfaceType;
}

export class ImplementsMetadata extends Metadata<ImplementsMetadataConfig, ImplementsMetadataBuild> {
  public get definitionClass() {
    return this.config.definitionClass;
  }

  protected buildMetadata() {
    const targetMetadata = this.getTargetMetadata();
    const targetTypeInstance = targetMetadata.build.typeInstance;
    return { targetMetadata, targetTypeInstance };
  }

  protected getTargetMetadata(): InterfaceTypeMetadata {
    const { targetDefinitionClass } = this.config;
    const metadata = this.meta.getDefinitionMetadata(InterfaceTypeMetadata, targetDefinitionClass);
    return metadata;
  }
}
