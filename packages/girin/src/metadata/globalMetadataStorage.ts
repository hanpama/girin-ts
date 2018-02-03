import { MetadataStorage } from "./MetadataStorage";
import { createScalarMetadata } from "./ScalarMetadata";


export const globalMetadataStorage: MetadataStorage = new MetadataStorage();
createScalarMetadata(globalMetadataStorage);
