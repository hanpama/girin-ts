import { TypeExpression, TypeArg } from "./TypeExpression";
import { GraphQLList, GraphQLType, GraphQLNonNull } from "graphql";
import { MetadataStorage } from "./MetadataStorage";
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
  public getTypeInstance(storage: MetadataStorage, targetClass?: Function): GraphQLType {
    const innerTypeInstance = this.innerType.getTypeInstance(storage, targetClass);
    return new GraphQLList(innerTypeInstance);
  }

  public getInstantiator(storage: MetadataStorage, targetClass?: Function) {
    const innerInstantiator = this.innerType.getInstantiator(storage, targetClass);
    return (values: any[]) => values.map(value => innerInstantiator(value));
  }
}

export class NonNull extends Structure {
  public getTypeInstance(storage: MetadataStorage, targetClass?: Function): GraphQLType {
    const innerTypeInstance = this.innerType.getTypeInstance(storage, targetClass);
    return new GraphQLNonNull(innerTypeInstance);
  }

  public getInstantiator(storage: MetadataStorage, targetClass?: Function) {
    return this.innerType.getInstantiator(storage, targetClass);
  }
}
