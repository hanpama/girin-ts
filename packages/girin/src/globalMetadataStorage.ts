import { MetadataStorage } from "./base/MetadataStorage";
import { loadBuiltInScalar } from './builtins/scalar';


export function createMetadataStorage() {
  const storage = new MetadataStorage();
  loadBuiltInScalar(storage);
  return storage;
}

/**
 * Global MetadataStorage used by default.
 */
export const globalMetadataStorage: MetadataStorage = createMetadataStorage();
