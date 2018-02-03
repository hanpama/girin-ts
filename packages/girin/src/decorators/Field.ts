import { FieldMetadata } from '../metadata/FieldMetadata';
import { Generic } from "../metadata/Generic";
import { globalMetadataStorage } from "../metadata/globalMetadataStorage";

export interface FieldDecoratorOptions {
  description?: string;
  deprecationReason?: string;
}

export function Field(type: string, options?: FieldDecoratorOptions): Function {
  return function(objectType: any, fieldName: string) {
    const definitionClass = objectType.constructor as any;
    FieldMetadata.create({
      fieldName,
      definitionClass,
      description: options && options.description,
      deprecationReason: options && options.deprecationReason,
      generic: Generic.of(type),
      meta: globalMetadataStorage,
    });
  };
}
