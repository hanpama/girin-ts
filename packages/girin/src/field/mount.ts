import { Field, FieldReference, FieldProps } from "./Field";
import { MetadataStorage } from "../base/MetadataStorage";
import { globalMetadataStorage } from "../globalMetadataStorage";


export function mount(field: Field, props: FieldProps = {}, storage: MetadataStorage = globalMetadataStorage) {
  return (target: object, propertyKey: string) => {
    const reference: FieldReference = { field, name: propertyKey, props };
    globalMetadataStorage.registerFieldReference(reference, (target as any).constructor);
  }
}
