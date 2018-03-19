import { MetadataStorage } from "./base/MetadataStorage";
import { DefinitionMetadata } from "./base/DefinitionMetadata";
import { globalMetadataStorage } from "./globalMetadataStorage";


export interface TypeBuilderOptions {
  meta?: MetadataStorage;
}

export function getGraphQLType(targetClass: Function, options?: TypeBuilderOptions): any {

  const typeMetadata = globalMetadataStorage.getDefinitionMetadata(DefinitionMetadata, targetClass);
  if (!typeMetadata) {
    throw new Error(`Given class ${targetClass.name} has no corresponding metadata`);
  }
  return typeMetadata.typeInstance;
}
