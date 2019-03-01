import { Definition, DefinitionKind } from './Definition';
import { Reference } from './Reference';


export type Metadata = Reference<any> | Definition<any>;

/**
 * Keep all [[Definition]] and references.
 * Provide methods to query metadata with its associated class or graphql type name.
 */
export class MetadataStorage {
  protected readonly deferredRegister: Array<() => void> = [];
  protected deferredResolved = false;

  public readonly definitions: Definition[] = [];
  public readonly references: Reference[] = [];

  public deferRegister(metadataFn: () => void) {
    this.deferredRegister.unshift(metadataFn);
  }

  protected resolveDeferred() {
    while (this.deferredRegister.length > 0) {
      this.deferredRegister.pop()!();
    }
  }

  public registerMetadata(metadata: Metadata[]) {
    metadata.map(entry => {
      if (entry instanceof Definition) {
        this.definitions.push(entry);
      } else if (entry instanceof Reference) {
        this.references.push(entry);
      }
    });
  }

  /**
   *
   * Get a [[Definition]] object which is instance of the `metadataClass` and associated to `linkedClass`
   * @param metadataClass A [[Definition]] subclass to query
   * @param definitionKey A class associated with metadata to query
   * @param asKind
   */
  public getDefinition<T extends Definition>(metadataClass: { new (...args: any[]): T; }, definitionKey: Object, asKind: DefinitionKind): T | undefined {
    this.resolveDeferred();

    const entry = this.definitions.find(metadata => {
      let classOrNameMatched: boolean;
      if (typeof definitionKey === 'string') {
        classOrNameMatched = metadata.definitionName === definitionKey;
      } else {
        classOrNameMatched = metadata.definitionClass === definitionKey;
      }
      const typeMatched = asKind === 'any' || metadata.kind === 'any' || metadata.kind === asKind;
      return classOrNameMatched && (metadata instanceof metadataClass) && typeMatched;
    });

    return entry as T;
  }

  public findReference<T extends Reference>(metadataClass: { new (...args: any[]): T }, definitionKey: Object): T[] {
    this.resolveDeferred();

    const entries = this.references.filter(metadata => {
      let classOrNameMatched: boolean;
      if (definitionKey instanceof Function) {
        classOrNameMatched = metadata.source instanceof Function && equalsOrInherits(definitionKey, metadata.source);
      }
      else {
        classOrNameMatched = metadata.source === definitionKey;
      }
      // const typeMatched = metadata.kind === asKind;
      return classOrNameMatched && (metadata instanceof metadataClass);
    });
    return entries as T[];
  }
}

export function equalsOrInherits(cls: Function, superClass: Function) {
  return cls === superClass || cls.prototype instanceof superClass;
}
