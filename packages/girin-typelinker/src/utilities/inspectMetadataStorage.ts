import { MetadataStorage } from '../base';


export function inspectMetadataStorage(storage: MetadataStorage) {
  const definitionMetadata = storage.definitionMetadata.map(meta => ({
    metadataType: meta.metadata.constructor.name,
    metadataConfig: meta.metadata.config,
    linkedClass: meta.linkedClass,
  }));

  const fieldReferences = storage.fieldReferences.map(entry => ({
    definitionClass: entry.definitionClass,
    fieldConfig: entry.field.config,
  }))
  storage.inputFieldReferences
  storage.memoizedTypeInstanceMap

  return { definitionMetadata, fieldReferences };
}