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

  constructor(typeOption: TypeArg | Lazy<TypeArg> | TypeExpression | Lazy<TypeExpression>) {
    this.typeArg = typeOption;
  }

  public resolve(targetClass?: Function): TypeExpression {
    const { typeArg } = this;
    if (isLazy(typeArg)) {
      const resolved = typeArg(targetClass);
      if (resolved instanceof TypeExpression) {
        return resolved.resolve(targetClass);
      }
      return new TypeExpression(resolved);
    } else {
      if (typeArg instanceof TypeExpression) {
        return typeArg.resolve(targetClass);
      } else {
        return this;
      }
    }
  }

  public typeArg: TypeArg | Lazy<TypeArg> | TypeExpression | Lazy<TypeExpression>;

  protected getDefinitionEntry(storage: MetadataStorage): DefinitionEntry {
    if (this.typeArg instanceof Function) {
      return storage.getDefinition(Definition, this.typeArg);
    } else if (typeof this.typeArg === 'string'){
      return storage.getDefinitionByName(this.typeArg);
    } else {
      throw new Error(`Cannot find any Definition with TypeExpression of ${formatObjectInfo(this.typeArg)}`);
    }
  }

  public buildTypeInstance(storage: MetadataStorage, targetClass?: Function): GraphQLType {

    const resolvedTypeExpression = this.resolve(targetClass);
    if (this !== resolvedTypeExpression) {
      return resolvedTypeExpression.buildTypeInstance(storage, targetClass);
    }

    if (isType(resolvedTypeExpression.typeArg)) {
      return resolvedTypeExpression.typeArg;
    }

    const entry = resolvedTypeExpression.getDefinitionEntry(storage);

    let typeInstance = storage.memoizedTypeInstanceMap.get(entry.key);
    if (!typeInstance) {
      const typeMetadata = storage.getDefinition(Definition, entry.key);
      if (!typeMetadata) {
        throw new Error(`Given class ${entry.key.name} has no corresponding metadata`);
      }
      typeInstance = typeMetadata.metadata.buildTypeInstance(storage, entry.key);
      storage.memoizedTypeInstanceMap.set(entry.key, typeInstance);
    }
    return typeInstance;
  }
}
