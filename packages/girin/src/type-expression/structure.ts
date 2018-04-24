import { TypeExpression, TypeArg } from "./TypeExpression";
import { GraphQLList, GraphQLType, GraphQLResolveInfo, GraphQLNonNull } from "graphql";
import { MetadataStorage } from "../base/MetadataStorage";
import { Instantiator, isPromise, ConcreteClass } from "../types";


export abstract class Structure extends TypeExpression {
  public static of<T extends Structure>(this: ConcreteClass<T>, innerType: TypeExpression | TypeArg) {
    return new this(innerType instanceof TypeExpression ? innerType: new TypeExpression(innerType));
  }

  constructor(innerType: TypeExpression) {
    super(innerType.typeArg);
    this.innerType = innerType;
  }

  public innerType: TypeExpression;
}

export class List extends Structure {
  public buildInstantiator(storage: MetadataStorage): Instantiator {
    const innerInstantiator = this.innerType.buildInstantiator(storage);
    return (value: any[], context: any, info: GraphQLResolveInfo) => (
      value.map(innerValue => isPromise(innerValue)
        ? innerValue.then(resolved => innerInstantiator(resolved, context, info))
        : innerInstantiator(innerValue, context, info)
      )
    );
  }
  public buildTypeInstance(storage: MetadataStorage): GraphQLType {
    const innerTypeInstance = super.buildTypeInstance(storage);
    return new GraphQLList(innerTypeInstance);
  }
}

export class NonNull extends Structure {
  public buildTypeInstance(storage: MetadataStorage): GraphQLType {
    const innerTypeInstance = this.innerType.buildTypeInstance(storage);
    return new GraphQLNonNull(innerTypeInstance);
  }
}
