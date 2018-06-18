import { GraphQLType, isType } from "graphql";
import { MetadataStorage, DefinitionEntry } from "../base/MetadataStorage";
import { isLazy, Lazy } from "../types";
import { Definition } from "../base/Definition";
import { formatObjectInfo } from "../utilities/formatObjectInfo";


export type TypeArg = GraphQLType | string | Function;

/**
 * Contain an argument which can be resolved to GraphQLType instance.
 */
export class TypeExpression {
  protected options: TypeArg | Lazy<TypeArg>;

  constructor(typeArg: TypeArg | Lazy<TypeArg>) {
    this.typeArg = typeArg;
  }

  private getCompleteTypeArg(): TypeArg {
    const { typeArg } = this;
    return isLazy(typeArg) ? typeArg() : typeArg;
  }

  public typeArg: TypeArg | Lazy<TypeArg>;

  public getDefinitionEntry(storage: MetadataStorage): DefinitionEntry {
    const completeTypeArg = this.getCompleteTypeArg();

    if (completeTypeArg instanceof Function) {
      return storage.getDefinition(Definition, completeTypeArg);
    } else if (typeof completeTypeArg === 'string'){
      return storage.getDefinitionByName(completeTypeArg);
    } else {
      throw new Error(`Cannot find any Definition with TypeExpression of ${formatObjectInfo(completeTypeArg)}`);
    }
  }

  public buildTypeInstance(storage: MetadataStorage): GraphQLType {

    const completeTypeArg = this.getCompleteTypeArg();
    if (isType(completeTypeArg)) {
      return completeTypeArg;
    }
    const entry = this.getDefinitionEntry(storage);

    let typeInstance = storage.memoizedTypeInstanceMap.get(entry.definitionClass);
    if (!typeInstance) {
      const typeMetadata = storage.getDefinition(Definition, entry.definitionClass);
      if (!typeMetadata) {
        throw new Error(`Given class ${entry.definitionClass.name} has no corresponding metadata`);
      }
      typeInstance = typeMetadata.metadata.buildTypeInstance(storage, entry.definitionClass);
      storage.memoizedTypeInstanceMap.set(entry.definitionClass, typeInstance);
    }
    return typeInstance;
  }
}
