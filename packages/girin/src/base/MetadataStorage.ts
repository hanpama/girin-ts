import { isSubClassOf } from '../types';
import { Metadata } from './Metadata';
import { DefinitionMetadata } from './DefinitionMetadata';

/**
 * Keep all [[DefinitionMetadata]] and [[GenericMetadata]].
 * Provide methods to query metadata with its associated class or graphql type name.
 */
export class MetadataStorage {

  protected readonly genericMetadata: any[] = [];
  protected readonly definitionMetadata: any[] = [];

  /**
   * Add a new [[Metadata]] object to storage.
   * @param metadata A metadata object to register
   */
  register(metadata: Metadata) {
    if (metadata instanceof DefinitionMetadata) {
      this.definitionMetadata.unshift(metadata);
    } else {
      this.genericMetadata.push(metadata);
    }
  }

  /**
   * Get a [[DefinitionMetadata]] object which is instance of the `metadataClass` and associated to `definitionClass`
   * @param metadataClass A [[DefinitionMetadata]] subclass to query
   * @param definitionClass A class associated with metadata to query
   */
  getDefinitionMetadata<T extends Metadata>(metadataClass: { new (...args: any[]): T; }, definitionClass: Function) {
    const foundMetadata = this.definitionMetadata.find(metadata => {
      return isSubClassOf(definitionClass, metadata.definitionClass) && metadata instanceof metadataClass
    });
    if (!foundMetadata) {
      throw new Error(`Cannot get ${metadataClass.name} of ${definitionClass.name} from MetadataStorage`);
    }
    return foundMetadata as T;
  }

  /**
   * Get a [[DefinitionMetadata]] object by the name of the GraphQLType that the metadata will generate.
   * @param name The name of a GraphQLType which will be built from metadata to query
   */
  getDefinitionMetadataByName(name: string): DefinitionMetadata {
    const metadata = this.definitionMetadata.find((meta: DefinitionMetadata) => meta.typeName === name);
    if (!metadata) {
      throw new Error(`Cannot find metadata with given name: ${name}`);
    }
    return metadata;
  }

  /**
   * Find all [[GenericMetadata]] which is instance of the `metadataClass` and associated to `definitionClass`
   * @param metadataClass A [[GenericMetadata]] subclass to query
   * @param definitionClass A class associated with metadata to query
   */
  filter<T extends Metadata>(metadataClass: { new (...args: any[]): T; }, definitionClass: Function) {
    const filterdMetadata = this.genericMetadata.filter(metadata => {
      return isSubClassOf(definitionClass, metadata.definitionClass) && metadata instanceof metadataClass
    });
    return filterdMetadata as T[];
  }
}
