import { ObjectType } from './ObjectType';
import { MetadataStorage, FieldReferenceEntry, FieldMixinEntry } from '../metadata';


export class SubscriptionType extends ObjectType {
  buildFieldConfig(storage: MetadataStorage, entry: FieldReferenceEntry | FieldMixinEntry) {
    const { resolve, ...rest } = super.buildFieldConfig(storage, entry);
    return { ...rest, subscribe: resolve, resolve: (v: any) => v };
  }
}
