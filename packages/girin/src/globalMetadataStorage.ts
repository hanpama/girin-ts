import { MetadataStorage } from "./base/MetadataStorage";
import { loadBuiltInScalar } from './builtins/scalar';

/**
 * Global MetadataStorage used by default.
 */
export const globalMetadataStorage: MetadataStorage = new MetadataStorage();

loadBuiltInScalar(globalMetadataStorage);
