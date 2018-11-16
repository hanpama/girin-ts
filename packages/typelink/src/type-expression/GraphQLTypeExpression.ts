import { GraphQLType } from 'graphql';

import { defaultInputFieldInstantiator, Instantiator } from '../types';
import { TypeExpression } from './TypeExpression';
import { isNamedType } from 'graphql/type/definition';


export class GraphQLTypeExpression extends TypeExpression {
  constructor(protected typeInstance: GraphQLType) {
    super();
  }

  public getTypeName() {
    const { typeInstance } = this;
    if (isNamedType(typeInstance)) {
      return typeInstance.name;
    } else {
      throw new Error(`Cannot resolve name: ${typeInstance} is not a GraphQLNamedType`);
    }
  }

  public getType(): GraphQLType {
    return this.typeInstance;
  }
  public getInstantiator(): Instantiator {
    return defaultInputFieldInstantiator;
  }
}
