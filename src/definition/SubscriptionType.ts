import { ObjectType } from './ObjectType';
import { Field } from '../reference';
import { TypeResolvingContext } from '../type-expression';


export class SubscriptionType extends ObjectType {
  protected buildFieldConfig(context: TypeResolvingContext, field: Field) {
    const { resolve, ...rest } = super.buildFieldConfig(context, field);
    // it constrains the given async iterator directly returns an object with the expected type
    return { ...rest, subscribe: resolve, resolve: (v: any) => v };
  }
}
