import { GraphQLNamedType, GraphQLFieldResolver, GraphQLType } from 'graphql';

import { Definition } from './Definition';
import { isSubClassOf } from '../types';
import { Field, InputField } from '../field';
import { formatObjectInfo } from '../utilities/formatObjectInfo';
import { TypeExpressionKind, TypeExpression } from './TypeExpression';
import { Entry, property } from '../utilities/Entry';


export class DefinitionEntry<T extends Definition = Definition> {
  constructor(
    public storage: MetadataStorage,
    public linkedClass: Function,
    public metadata: T,
  ) { }

  protected graphqlType: GraphQLType;

  public getOrCreateTypeInstance() {
    if (!this.graphqlType) {
      const { metadata, storage, linkedClass } = this;
      this.graphqlType = metadata.buildTypeInstance(storage, linkedClass);
    }
    return this.graphqlType;
  }
}

export class FieldReferenceEntry extends Entry<FieldReferenceEntry> {
  @property() public definitionClass: Function;
  @property() public field: Field;
  @property() public resolver?: GraphQLFieldResolver<any, any>;
}

export class ExtensionFieldReferenceEntry extends Entry<ExtensionFieldReferenceEntry> {
  @property() public extendingTypeName: string;
  @property() public field: Field;
  @property() public resolver?: GraphQLFieldResolver<any, any>;
}

export class InputFieldReferenceEntry extends Entry<InputFieldReferenceEntry>{
  @property() public definitionClass: Function;
  @property() public field: InputField;
}

export class ExtensionInputFieldReferenceEntry extends Entry<ExtensionInputFieldReferenceEntry>{
  @property() public extendingTypeName: string;
  @property() public field: InputField;
}

export class ImplementReferenceEntry extends Entry<ImplementReferenceEntry> {
  @property() public definitionClass: Function;
  @property() public interfaceType: TypeExpression;
}

/**
 * Keep all [[Definition]] and references.
 * Provide methods to query metadata with its associated class or graphql type name.
 */
export class MetadataStorage {
  public readonly definitionMetadata: Array<DefinitionEntry<Definition>> = [];
  public readonly memoizedTypeInstanceMap: Map<DefinitionEntry, GraphQLNamedType> = new Map();

  public readonly fieldReferences: Array<FieldReferenceEntry> = [];
  public readonly inputFieldReferences: Array<InputFieldReferenceEntry> = [];
  public readonly implementReferences: Array<ImplementReferenceEntry> = [];
  public readonly extensionFieldReferences: Array<ExtensionFieldReferenceEntry> = [];
  public readonly extensionInputFieldReferences: Array<ExtensionInputFieldReferenceEntry> = [];

  /**
   * Add a new [[Metadata]] object to storage.
   * @param metadata A metadata object to register
   */
  register(metadata: Definition<any>, key: Function) {
    this.definitionMetadata.push(new DefinitionEntry(this, key, metadata));
  }

  registerImplementReference(args: ImplementReferenceEntry) {
    this.implementReferences.push(new ImplementReferenceEntry(args));
  }

  registerFieldReference(args: FieldReferenceEntry) {
    this.fieldReferences.push(new FieldReferenceEntry(args));
  }

  registerInputFieldReference(args: InputFieldReferenceEntry) {
    this.inputFieldReferences.push(new InputFieldReferenceEntry(args));
  }

  registerExtensionFieldReference(args: ExtensionFieldReferenceEntry) {
    this.extensionFieldReferences.push(new ExtensionFieldReferenceEntry(args));
  }

  registerExtensionInputFieldReference(args: ExtensionInputFieldReferenceEntry) {
    this.extensionInputFieldReferences.push(new ExtensionInputFieldReferenceEntry(args));
  }

  /**
   *
   * Get a [[Definition]] object which is instance of the `metadataClass` and associated to `linkedClass`
   * @param metadataClass A [[Definition]] subclass to query
   * @param targetClassOrName A class associated with metadata to query
   * @param asOutput
   */
  getDefinition<T extends Definition>(metadataClass: { new (...args: any[]): T; }, targetClassOrName: Function | string, asKind: TypeExpressionKind) {
    const entry = this.definitionMetadata.find(entry => {
      const { metadata, linkedClass } = entry;
      let classOrNameMatched: boolean;
      if (typeof targetClassOrName === 'string') {
        classOrNameMatched = metadata.typeName === targetClassOrName;
      } else {
        classOrNameMatched = linkedClass === targetClassOrName;
      }
      let typeMatched: boolean;
      if (asKind === 'input') {
        typeMatched = metadata.isInputType();
      } else if (asKind === 'output') {
        typeMatched = metadata.isOutputType();
      } else {
        typeMatched = true;
      }

      return classOrNameMatched && (metadata instanceof metadataClass) && typeMatched;
    });
    if (!entry) {
      throw new Error(`Cannot get ${metadataClass.name} of ${formatObjectInfo(targetClassOrName)} from MetadataStorage`);
    }
    return entry as DefinitionEntry<T>;
  }
  queryImplementReferences(linkedClass: Function): ImplementReferenceEntry[] {
    return this.implementReferences.filter(entry => (
      linkedClass === entry.definitionClass || isSubClassOf(linkedClass, entry.definitionClass)
    ));
  }
  queryFieldReferences(linkedClass: Function): FieldReferenceEntry[] {
    return this.fieldReferences.filter(entry => (
      linkedClass === entry.definitionClass || isSubClassOf(linkedClass, entry.definitionClass)
    ));
  }
  queryInputFieldReference(linkedClass: Function): InputFieldReferenceEntry[] {
    return this.inputFieldReferences.filter(entry => (
      linkedClass === entry.definitionClass || isSubClassOf(linkedClass, entry.definitionClass)
    ));
  }
  queryExtensionFieldReferences(extendingTypeName: string): ExtensionFieldReferenceEntry[] {
    return this.extensionFieldReferences.filter(entry => entry.extendingTypeName === extendingTypeName);
  }
  queryExtensionInputFieldReferences(extendingTypeName: string): ExtensionInputFieldReferenceEntry[] {
    return this.extensionInputFieldReferences.filter(entry => entry.extendingTypeName === extendingTypeName);
  }
}
