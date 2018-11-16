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
   * @param classOrName A class associated with metadata to query
   * @param asKind
   */
  public getDefinition<T extends Definition>(metadataClass: { new (...args: any[]): T; }, classOrName: Function | string, asKind: DefinitionKind): T | undefined {
    this.resolveDeferred();

    const entry = this.definitions.find(metadata => {
      let classOrNameMatched: boolean;
      if (typeof classOrName === 'string') {
        classOrNameMatched = metadata.definitionName === classOrName;
      } else {
        classOrNameMatched = metadata.definitionClass === classOrName;
      }
      const typeMatched = asKind === 'any' || metadata.kind === 'any' || metadata.kind === asKind;
      return classOrNameMatched && (metadata instanceof metadataClass) && typeMatched;
    });

    return entry as T;
  }

  public findReference<T extends Reference>(metadataClass: { new (...args: any[]): T }, classOrName: Function | string): T[] {
    this.resolveDeferred();

    const entries = this.references.filter(metadata => {
      let classOrNameMatched: boolean;
      if (typeof classOrName === 'string') {
        classOrNameMatched = metadata.source === classOrName;
      } else {
        classOrNameMatched = metadata.source instanceof Function && equalsOrInherits(classOrName, metadata.source);
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
