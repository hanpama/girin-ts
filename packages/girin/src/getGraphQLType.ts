import { MetadataStorage } from "./metadata/MetadataStorage";
import { Metadata } from "./metadata/Metadata";
import { globalMetadataStorage } from "./metadata/globalMetadataStorage";

export interface TypeBuilderOptions {
  meta?: MetadataStorage;
}

export function getGraphQLType(definitionClass: Function, options?: TypeBuilderOptions): any {

  const typeMetadata = globalMetadataStorage.getDefinitionMetadata(Metadata, definitionClass);
  if (!typeMetadata) {
    throw new Error(`Given class ${definitionClass.name} has no corresponding metadata`);
  }
  return typeMetadata.build.typeInstance;
}
