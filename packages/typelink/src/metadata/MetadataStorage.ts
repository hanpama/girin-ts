import { GraphQLNamedType } from 'graphql';

import { Definition } from './Definition';
import { Reference } from './Reference';
import { formatObjectInfo } from '../utilities/formatObjectInfo';
import { TypeExpressionKind, TypeExpression } from '../type-expression';


export type MetadataFn = (...genericArgs: TypeExpression[]) => Metadata[];

export type Metadata = Reference<any> | Definition<any>;

/**
 * Keep all [[Definition]] and references.
 * Provide methods to query metadata with its associated class or graphql type name.
 */
export class MetadataStorage {
  protected readonly deferredMetadataFnQueue: Array<{ definitionClass: Function, metadataFn: MetadataFn }> = [];
  protected deferredResolved = false;
  protected readonly metadataArray: Metadata[] = [];
  protected readonly memoizedTypeInstanceMap: Map<Definition, GraphQLNamedType> = new Map();

  register(definitionClass: Function, metadataFn: MetadataFn) {
    this.deferredMetadataFnQueue.unshift({ definitionClass, metadataFn });
  }

  resolveDeferred() {
    while (this.deferredMetadataFnQueue.length > 0) {
      if (this.deferredResolved) { throw new Error('Something went wrong'); }

      const { definitionClass, metadataFn } = this.deferredMetadataFnQueue.pop()!;
      const metadata = metadataFn();
      metadata.map(item => {
        item.definitionClass = definitionClass;
        this.metadataArray.push(item);
      });
    }
    this.deferredResolved = true;
  }

  findMetadata<T extends Metadata>(entryClass: { new (...args: any[]): T }): T[] {
    return (this.metadataArray.filter(item => item instanceof entryClass) || []) as T[];
  }

  findDirectReferences<T extends Reference>(entryClass: { new(v: any): T }, targetClass: Function): T[] {
    return this.findMetadata(entryClass).filter(entry => equalsOrInherits(targetClass, entry.definitionClass));
  }

  findExtendReferences<T extends Reference>(entryClass: { new(v: any): T}, extendingTypeName: string): T[] {
    return this.findMetadata(entryClass).filter(entry => entry.extendingTypeName === extendingTypeName);
  }

  /**
   *
   * Get a [[Definition]] object which is instance of the `metadataClass` and associated to `linkedClass`
   * @param metadataClass A [[Definition]] subclass to query
   * @param targetClassOrName A class associated with metadata to query
   * @param asKind
   */
  getDefinition<T extends Definition>(metadataClass: { new (...args: any[]): T; }, targetClassOrName: Function | string, asKind: TypeExpressionKind) {
    const entry = this.findMetadata(Definition).find(metadata => {
      let classOrNameMatched: boolean;
      if (typeof targetClassOrName === 'string') {
        classOrNameMatched = metadata.definitionName === targetClassOrName;
      } else {
        classOrNameMatched = metadata.definitionClass === targetClassOrName;
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
    return entry as T;
  }
}

export function equalsOrInherits(cls: Function, superClass: Function) {
  return cls === superClass || cls.prototype instanceof superClass;
}
