import { MetadataStorage } from '../metadata/MetadataStorage';
import { ImplementsMetadata } from '../metadata/ImplementsMetadata';


export interface ImplementsDecoratorOptions {
  meta?: MetadataStorage;
}

export function Implements(targetNameOrDefinitionClass: Function | string, options: ImplementsDecoratorOptions = {}) {
  return function(definitionClass: Function & ImplementsDecoratorOptions) {
    const mergedConfig = Object.assign(options, definitionClass, { definitionClass, targetNameOrDefinitionClass });
    ImplementsMetadata.create(mergedConfig);
  };
}