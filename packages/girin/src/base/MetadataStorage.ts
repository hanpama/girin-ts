import { isSubClassOf } from '../types';
import { Metadata } from './Metadata';
import { DefinitionMetadata } from './DefinitionMetadata';


export class MetadataStorage {

  protected readonly genericMetadata: any[] = [];
  protected readonly definitionMetadata: any[] = [];

  register(metadata: Metadata) {
    if (metadata instanceof DefinitionMetadata) {
      this.definitionMetadata.unshift(metadata);
    } else {
      this.genericMetadata.push(metadata);
    }
  }

  getDefinitionMetadata<T extends Metadata>(metadataClass: { new (...args: any[]): T; }, definitionClass: Function) {
    const foundMetadata = this.definitionMetadata.find(metadata => {
      return isSubClassOf(definitionClass, metadata.definitionClass) && metadata instanceof metadataClass
    });
    if (!foundMetadata) {
      throw new Error(`Cannot get ${metadataClass.name} of ${definitionClass.name} from MetadataStorage`);
    }
    return foundMetadata as T;
  }

  getDefinitionMetadataByName(name: string): DefinitionMetadata {
    const metadata = this.definitionMetadata.find((meta: DefinitionMetadata) => meta.typeName === name);
    if (!metadata) {
      throw new Error(`Cannot find metadata with given name: ${name}`);
    }
    return metadata;
  }

  filter<T extends Metadata>(metadataClass: { new (...args: any[]): T; }, definitionClass: Function) {
    const filterdMetadata = this.genericMetadata.filter(metadata => {
      return isSubClassOf(definitionClass, metadata.definitionClass) && metadata instanceof metadataClass
    });
    return filterdMetadata as T[];
  }
}
