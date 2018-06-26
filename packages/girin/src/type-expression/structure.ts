import { TypeExpression, TypeArg } from "./TypeExpression";
import { GraphQLList, GraphQLType, GraphQLNonNull } from "graphql";
import { MetadataStorage } from "../base/MetadataStorage";
import { ConcreteClass } from "../types";


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
  public buildTypeInstance(storage: MetadataStorage, targetClass?: Function): GraphQLType {
    const innerTypeInstance = super.buildTypeInstance(storage, targetClass);
    return new GraphQLList(innerTypeInstance);
  }
}

export class NonNull extends Structure {
  public buildTypeInstance(storage: MetadataStorage, targetClass?: Function): GraphQLType {
    const innerTypeInstance = this.innerType.buildTypeInstance(storage, targetClass);
    return new GraphQLNonNull(innerTypeInstance);
  }
}
