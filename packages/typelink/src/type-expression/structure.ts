import { TypeExpression, TypeArg } from './TypeExpression';
import { GraphQLList, GraphQLType, GraphQLNonNull } from 'graphql';
import { MetadataStorage } from '../metadata';
import { ConcreteClass } from '../types';


export abstract class Structure extends TypeExpression {
  public static of<T extends Structure>(this: ConcreteClass<T>, innerType: TypeExpression | TypeArg) {
    return new this(innerType instanceof TypeExpression ? innerType : new TypeExpression(innerType));
  }

  constructor(innerType: TypeExpression) {
    super(innerType.typeArg);
    this.innerType = innerType;
  }

  public innerType: TypeExpression;
}

export class List extends Structure {
  public getTypeInstance(storage: MetadataStorage): GraphQLType {
    const innerTypeInstance = this.innerType.getTypeInstance(storage);
    return new GraphQLList(innerTypeInstance);
  }

  public getInstantiator(storage: MetadataStorage) {
    const innerInstantiator = this.innerType.getInstantiator(storage);
    return (values: any[]) => values.map(value => innerInstantiator(value));
  }
}

export class NonNull extends Structure {
  public getTypeInstance(storage: MetadataStorage): GraphQLType {
    const innerTypeInstance = this.innerType.getTypeInstance(storage);
    return new GraphQLNonNull(innerTypeInstance);
  }

  public getInstantiator(storage: MetadataStorage) {
    return this.innerType.getInstantiator(storage);
  }
}
