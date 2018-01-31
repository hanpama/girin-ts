import { MetadataStorage } from "../index";
import { GraphQLInterfaceType } from "graphql";

export interface ImplementsMetadataConfig {
  meta?: MetadataStorage;
  definitionClass: Function;
  targetNameOrDefinitionClass: string | Function;
}


export class ImplementsMetadata {

  static create(config: ImplementsMetadataConfig) {
    const metadata = new ImplementsMetadata(config);
    metadata.meta.implementsMetadata.push(metadata);
    return metadata;
  }

  get meta(): MetadataStorage {
    return this.config.meta || MetadataStorage.getMetadataStorage();
  }

  get definitionClass() { return this.config.definitionClass }

  protected config: ImplementsMetadataConfig;
  protected constructor(config: ImplementsMetadataConfig) {
    this.config = config;
  }

  getTargetTypeInstance(): GraphQLInterfaceType {
    const { targetNameOrDefinitionClass } = this.config;
    const metadata = this.meta.findInterfaceTypeMetadata(targetNameOrDefinitionClass);
    if (!metadata) {
      const targetName = (targetNameOrDefinitionClass as any).name || targetNameOrDefinitionClass.toString();
      throw new Error(`${targetName} has no corresponding InterfaceType instance`);
    }
    return metadata.build.typeInstance;
  }
}