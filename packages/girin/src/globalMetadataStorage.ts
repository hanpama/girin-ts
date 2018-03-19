import { MetadataStorage } from "./base/MetadataStorage";
import { loadBuiltInScalar } from './builtins/scalar';


export const globalMetadataStorage: MetadataStorage = new MetadataStorage();

loadBuiltInScalar(globalMetadataStorage);
