import { GraphQLNamedType } from 'graphql';

import { Definition } from '../definition/Definition';
import { formatObjectInfo } from '../utilities/formatObjectInfo';
import { TypeExpressionKind } from '../type-expression';
import { DefinitionEntry, Entry, ReferenceEntry, MixinEntry } from './storageEntries';


/**
 * Keep all [[Definition]] and references.
 * Provide methods to query metadata with its associated class or graphql type name.
 */
export class MetadataStorage {
  public readonly memoizedTypeInstanceMap: Map<DefinitionEntry<any, any>, GraphQLNamedType> = new Map();
  public readonly typeEntriesMap: Map<Function, Entry<any>[]> = new Map();

  registerEntry(definitionClass: Function, entry: Entry<any>) {
    let entries = this.typeEntriesMap.get(entry.constructor);
    if (!entries) {
      entries = [];
      this.typeEntriesMap.set(entry.constructor, entries);
    }
    entry.definitionClass = definitionClass;
    entries.push(entry);
  }

  findEntries<T extends Entry<any>>(entryClass: { new (...args: any[]): T }): T[] {
    return (this.typeEntriesMap.get(entryClass) || []) as T[];
  }

  findReferenceEntries<TEntry extends ReferenceEntry>(entryClass: { new(v: any): TEntry }, targetClass: Function): TEntry[] {
    return this.findEntries(entryClass).filter(entry => equalsOrInherits(targetClass, entry.definitionClass));
  }

  findMixinEntries<TEntry extends MixinEntry>(entryClass: { new(v: any): TEntry}, extendingTypeName: string): TEntry[] {
    return this.findEntries(entryClass).filter(entry => entry.extendingTypeName === extendingTypeName);
  }

  /**
   *
   * Get a [[Definition]] object which is instance of the `metadataClass` and associated to `linkedClass`
   * @param metadataClass A [[Definition]] subclass to query
   * @param targetClassOrName A class associated with metadata to query
   * @param asOutput
   */
  getDefinition<T extends Definition<U>, U>(metadataClass: { new (...args: any[]): T; }, targetClassOrName: Function | string, asKind: TypeExpressionKind) {
    const entry = this.findEntries(DefinitionEntry).find(entry => {
      const { metadata, definitionClass } = entry;

      let classOrNameMatched: boolean;
      if (typeof targetClassOrName === 'string') {
        classOrNameMatched = metadata.typeName === targetClassOrName;
      } else {
        classOrNameMatched = definitionClass === targetClassOrName;
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
    return entry as DefinitionEntry<T, U>;
  }
}

export function equalsOrInherits(cls: Function, superClass: Function) {
  return cls === superClass || cls.prototype instanceof superClass;
}
