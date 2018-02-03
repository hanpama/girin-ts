import { isSubClassOf } from '../utils';


export interface MetadataInterface {
  definitionClass: Function;
  name?: string;
}

export class MetadataStorage {

  // constructor(initialMetadata: MetadataInterface[]) {
  //   initialMetadata && initialMetadata.forEach(this.register.bind(this));
  // }

  protected readonly genericMetadata: any[] = [];
  protected readonly definitionMetadata: any[] = [];

  register(metadata: MetadataInterface) {
    if (typeof metadata.name === 'string') {
      this.definitionMetadata.push(metadata);
    } else {
      this.genericMetadata.push(metadata);
    }
  }

  getDefinitionMetadata<T extends MetadataInterface>(metadataClass: { new (...args: any[]): T; }, definitionClass: Function) {
    const foundMetadata = this.definitionMetadata.find(metadata => (
      metadata instanceof metadataClass && metadata.definitionClass === definitionClass
    ));
    if (!foundMetadata) {
      throw new Error(`Cannot get ${metadataClass.name} of ${definitionClass.name} from MetadataStorage`);
    }
    return foundMetadata as T;
  }

  getDefinitionMetadataByName(name: string): { name: string; definitionClass: Function } {
    const metadata = this.definitionMetadata.find(meta => meta.name === name);
    if (!metadata) {
      throw new Error(`Cannot find metadata with given name: ${name}`);
    }
    return metadata;
  }

  filter<T extends MetadataInterface>(metadataClass: { new (...args: any[]): T; }, definitionClass: Function) {
    const filterdMetadata = this.genericMetadata.filter(metadata => {
      return isSubClassOf(definitionClass, metadata.definitionClass) && metadata instanceof metadataClass
    });
    return filterdMetadata as T[];
  }
}