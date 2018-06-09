import { isSubClassOf, DefinitionClass } from '../types';
import { DefinitionMetadata } from './DefinitionMetadata';
import { GraphQLNamedType } from 'graphql';
import { FieldReference } from '../field/Field';
import { InputFieldReference } from '../field/InputField';


export interface DefinitionMetadataEntry<T extends DefinitionMetadata = DefinitionMetadata> {
  definitionClass: DefinitionClass;
  metadata: T;
}

export interface FieldReferenceEntry {
  definitionClass: DefinitionClass;
  reference: FieldReference
}

export interface InputFieldReferenceEntry {
  definitionClass: DefinitionClass;
  reference: InputFieldReference;
}

/**
 * Keep all [[DefinitionMetadata]] and [[GenericMetadata]].
 * Provide methods to query metadata with its associated class or graphql type name.
 */
export class MetadataStorage {
  public readonly definitionMetadata: Array<DefinitionMetadataEntry<any>> = [];
  public readonly memoizedTypeInstanceMap: Map<DefinitionClass, GraphQLNamedType> = new Map();
  public readonly fieldReferences: Array<FieldReferenceEntry> = [];
  public readonly inputFieldReferences: Array<InputFieldReferenceEntry> = [];

  /**
   * Add a new [[Metadata]] object to storage.
   * @param metadata A metadata object to register
   */
  register(metadata: DefinitionMetadata<any>, definitionClass: DefinitionClass) {
    if (metadata instanceof DefinitionMetadata) {
      this.definitionMetadata.push({ definitionClass, metadata });

    } else {
      throw new Error(`Cannot register to stroage: ${metadata}`);
    }
  }

  registerFieldReference(reference: FieldReference, definitionClass: DefinitionClass) {
    this.fieldReferences.push({ reference, definitionClass });
  }

  registerInputFieldReference(reference: InputFieldReference, definitionClass: DefinitionClass) {
    this.inputFieldReferences.push({ reference, definitionClass });
  }

  /**
   * Get a [[DefinitionMetadata]] object which is instance of the `metadataClass` and associated to `definitionClass`
   * @param metadataClass A [[DefinitionMetadata]] subclass to query
   * @param definitionClass A class associated with metadata to query
   */
  getDefinitionMetadata<T extends DefinitionMetadata>(metadataClass: { new (...args: any[]): T; }, definitionClass: Function) {
    const entry = this.definitionMetadata.find(entry => entry.definitionClass === definitionClass);
    if (!entry) {
      throw new Error(`Cannot get ${metadataClass.name} of ${definitionClass.name} from MetadataStorage`);
    }
    return entry as DefinitionMetadataEntry<T>;
  }

  /**
   * Get a [[DefinitionMetadata]] object by the name of the GraphQLType that the metadata will generate.
   * @param name The name of a GraphQLType which will be built from metadata to query
   */
  getDefinitionMetadataByName(name: string) {
    const entry = this.definitionMetadata.find(entry => entry.metadata.typeName === name);
    if (!entry) {
      throw new Error(`Cannot find metadata with given name: ${name}`);
    }
    return entry as DefinitionMetadataEntry<any>;
  }

  queryFieldReferences(definitionClass: Function): FieldReferenceEntry[] {
    return this.fieldReferences.filter(entry => isSubClassOf(definitionClass, entry.definitionClass));
  }

  queryInputFieldReference(definitionClass: Function): InputFieldReferenceEntry[] {
    return this.inputFieldReferences.filter(entry => isSubClassOf(definitionClass, entry.definitionClass));
  }
}
