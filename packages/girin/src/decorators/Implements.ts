import { ImplementsMetadata } from '../metadata/ImplementsMetadata';
import { globalMetadataStorage } from "../metadata/globalMetadataStorage";



export function Implements(targetDefinitionClass: Function) {
  return function(definitionClass: Function) {
    ImplementsMetadata.create({
      definitionClass,
      targetDefinitionClass,
      meta: globalMetadataStorage,
    });
  };
}