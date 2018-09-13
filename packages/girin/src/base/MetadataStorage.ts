import { GraphQLNamedType, GraphQLFieldResolver, GraphQLType } from 'graphql';

import { Definition } from './Definition';
import { isSubClassOf } from '../types';
import { Field, InputField } from '../field';
import { formatObjectInfo } from '../utilities/formatObjectInfo';
import { TypeExpressionKind } from './TypeExpression';


export class DefinitionEntry<T extends Definition = Definition> {
  constructor(
    public storage: MetadataStorage,
    public key: Function,
    public metadata: T,
  ) { };

  protected graphqlType: GraphQLType;

  public getOrCreateTypeInstance() {
    if (!this.graphqlType) {
      const { metadata, storage, key } = this;
      this.graphqlType = metadata.buildTypeInstance(storage, key);
    }
    return this.graphqlType;
  }
}

export class FieldReferenceEntry {
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
  public readonly memoizedTypeInstanceMap: Map<DefinitionEntry, GraphQLNamedType> = new Map();
  public readonly fieldReferences: Array<FieldReferenceEntry> = [];
  public readonly inputFieldReferences: Array<InputFieldReferenceEntry> = [];

  /**
   * Add a new [[Metadata]] object to storage.
   * @param metadata A metadata object to register
   */
  register(metadata: Definition<any>, key: Function) {
    if (metadata instanceof Definition) {
      this.definitionMetadata.push(new DefinitionEntry(this, key, metadata));

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
   * Get a [[Definition]] object which is instance of the `metadataClass` and associated to `linkedClass`
   * @param metadataClass A [[Definition]] subclass to query
   * @param targetClassOrName A class associated with metadata to query
   * @param asOutput
   */
  getDefinition<T extends Definition>(metadataClass: { new (...args: any[]): T; }, targetClassOrName: Function | string, asKind: TypeExpressionKind) {
    const entry = this.definitionMetadata.find(entry => {
      const { metadata, key } = entry;
      let classOrNameMatched: boolean;
      if (typeof targetClassOrName === 'string') {
        classOrNameMatched = metadata.typeName === targetClassOrName;
      } else {
        classOrNameMatched = key === targetClassOrName;
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

  getFieldReference(resolver: Function): FieldReferenceEntry {
    const entry = this.fieldReferences.find(entry => entry.resolver === resolver);
    if (!entry) {
      throw new Error(`Cannot find metadata with given function: ${resolver}`);
    }
    return entry;
  }

  queryFieldReferences(linkedClass: Function): FieldReferenceEntry[] {
    return this.fieldReferences.filter(entry => (
      linkedClass === entry.container || isSubClassOf(linkedClass, entry.container)
    ));
  }

  queryInputFieldReference(linkedClass: Function): InputFieldReferenceEntry[] {
    return this.inputFieldReferences.filter(entry => (
      linkedClass === entry.container || isSubClassOf(linkedClass, entry.container)
    ));
  }
}
