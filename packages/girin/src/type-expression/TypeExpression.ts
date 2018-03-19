import { GraphQLType, isType } from "graphql";
import { MetadataStorage } from "../base/MetadataStorage";
import { isLazy, Lazy, Instantiator } from "../types";
import { DefinitionMetadata } from "../base/DefinitionMetadata";


export type TypeArg = GraphQLType | string | Function;


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

  public resolveDefinitionMetadata(storage: MetadataStorage): DefinitionMetadata {
    const completeTypeArg = this.getCompleteTypeArg();

    if (completeTypeArg instanceof Function) {
      return storage.getDefinitionMetadata(DefinitionMetadata, completeTypeArg);
    } else if (typeof completeTypeArg === 'string'){
      return storage.getDefinitionMetadataByName(completeTypeArg);
    } else {
      throw new Error(`Cannot find any DefinitionMetadata with TypeExpression of ${completeTypeArg}`);
    }
  }

  public buildInstantiator(storage: MetadataStorage): Instantiator {
    const completeTypeArg = this.getCompleteTypeArg();
    if (isType(completeTypeArg)) {
      return (value: any) => value;
    }
    const { instantiate, definitionClass } = this.resolveDefinitionMetadata(storage);

    return function (source, context, info) {
      return source instanceof definitionClass ? source : instantiate(source);
    }
  }

  public buildTypeInstance(storage: MetadataStorage): GraphQLType {

    const completeTypeArg = this.getCompleteTypeArg();
    if (isType(completeTypeArg)) {
      return completeTypeArg;
    }
    const metadata = this.resolveDefinitionMetadata(storage);
    return metadata.typeInstance;
  }
}
