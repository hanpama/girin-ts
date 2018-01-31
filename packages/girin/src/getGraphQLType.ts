import { MetadataStorage } from "./metadata/MetadataStorage";
import { GraphQLType, isType } from 'graphql';

export interface TypeBuilderOptions {
  meta?: MetadataStorage;
}

export function getGraphQLType(definitionClassOrType: Function | GraphQLType, options?: TypeBuilderOptions): any {
  let meta: MetadataStorage;
  if (options && options.meta) {
    meta = options.meta;
  } else {
    meta = MetadataStorage.getMetadataStorage();
  }

  if (isType(definitionClassOrType)) {
    return definitionClassOrType;
  }

  const typeMetadata = meta.getDefinitionMetadata(definitionClassOrType);
  if (!typeMetadata) {
    throw new Error(`Given class ${definitionClassOrType.name} has no corresponding metadata`);
  }
  return typeMetadata.build.typeInstance;
}
