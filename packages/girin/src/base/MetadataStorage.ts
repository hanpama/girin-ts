import { isSubClassOf } from '../types';
import { Definition } from './Definition';
import { Field } from '../field';
import { InputField } from '../field/InputField';
import { GraphQLNamedType, GraphQLFieldResolver } from 'graphql';


export class DefinitionEntry<T extends Definition = Definition> {
  constructor(
    public key: Function,
    public metadata: T,
  ) { };
}

export class FieldReferenceEntry {
  public mountName: string;
  public container: Function;
  public field: Field;
  public resolver?: GraphQLFieldResolver<any, any>;

  constructor(values: FieldReferenceEntry) {
    Object.assign(this, values);
  }
}

export class InputFieldReferenceEntry {
  public container: Function;
  public field: InputField;

  constructor(values: InputFieldReferenceEntry) {
    Object.assign(this, values);
  }
}

/**
 * Keep all [[Definition]] and references.
 * Provide methods to query metadata with its associated class or graphql type name.
 */
export class MetadataStorage {
  public readonly definitionMetadata: Array<DefinitionEntry<Definition>> = [];
  public readonly memoizedTypeInstanceMap: Map<Function, GraphQLNamedType> = new Map();
  public readonly fieldReferences: Array<FieldReferenceEntry> = [];
  public readonly inputFieldReferences: Array<InputFieldReferenceEntry> = [];

  /**
   * Add a new [[Metadata]] object to storage.
   * @param metadata A metadata object to register
   */
  register(metadata: Definition<any>, key: Function) {
    if (metadata instanceof Definition) {
      this.definitionMetadata.push(new DefinitionEntry(key, metadata));

    } else {
      throw new Error(`Cannot register to stroage: ${metadata}`);
    }
  }

  registerFieldReference(args: FieldReferenceEntry) {
    this.fieldReferences.push(new FieldReferenceEntry(args));
  }

  registerInputFieldReference(args: InputFieldReferenceEntry) {
    this.inputFieldReferences.push(new InputFieldReferenceEntry(args));
  }

  /**
   * Get a [[Definition]] object which is instance of the `metadataClass` and associated to `componentClass`
   * @param metadataClass A [[Definition]] subclass to query
   * @param componentClass A class associated with metadata to query
   */
  getDefinition<T extends Definition>(metadataClass: { new (...args: any[]): T; }, componentClass: Function) {
    const entry = this.definitionMetadata.find(entry => entry.key === componentClass);
    if (!entry) {
      throw new Error(`Cannot get ${metadataClass.name} of ${componentClass.name} from MetadataStorage`);
    }
    return entry as DefinitionEntry<T>;
  }

  /**
   * Get a [[Definition]] object by the name of the GraphQLType that the metadata will generate.
   * @param name The name of a GraphQLType which will be built from metadata to query
   */
  getDefinitionByName(name: string) {
    const entry = this.definitionMetadata.find(entry => entry.metadata.typeName === name);
    if (!entry) {
      throw new Error(`Cannot find metadata with given name: ${name}`);
    }
    return entry as DefinitionEntry<any>;
  }

  getFieldReference(resolver: Function): FieldReferenceEntry {
    const entry = this.fieldReferences.find(entry => entry.resolver === resolver);
    if (!entry) {
      throw new Error(`Cannot find metadata with given function: ${resolver}`);
    }
    return entry;
  }

  queryFieldReferences(componentClass: Function): FieldReferenceEntry[] {
    return this.fieldReferences.filter(entry => (
      componentClass === entry.container || isSubClassOf(componentClass, entry.container)
    ));
  }

  queryInputFieldReference(componentClass: Function): InputFieldReferenceEntry[] {
    return this.inputFieldReferences.filter(entry => (
      componentClass === entry.container || isSubClassOf(componentClass, entry.container)
    ));
  }
}
