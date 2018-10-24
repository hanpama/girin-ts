import { GraphQLType } from 'graphql';

import { defaultInputFieldInstantiator, Instantiator } from '../types';
import { TypeExpression } from './TypeExpression';


export class GraphQLTypeExpression extends TypeExpression {
  constructor(protected typeInstance: GraphQLType) {
    super();
  }

  public getType(): GraphQLType {
    return this.typeInstance;
  }
  public getInstantiator(): Instantiator {
    return defaultInputFieldInstantiator;
  }
}
