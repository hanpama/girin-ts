import { ObjectType } from './ObjectType';
import { MetadataStorage } from '../metadata';
import { Field } from '../reference';


export class SubscriptionType extends ObjectType {
  buildFieldConfig(storage: MetadataStorage, entry: Field) {
    const { resolve, ...rest } = super.buildFieldConfig(storage, entry);
    // it constrains the given async iterator directly returns an object with the expected type
    return { ...rest, subscribe: resolve, resolve: (v: any) => v };
  }
}
