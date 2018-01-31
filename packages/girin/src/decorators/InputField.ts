
import { InputFieldMetadata } from "../metadata/InputFieldMetadata";
import { MetadataStorage } from "../metadata/MetadataStorage";
import { Generic } from "../metadata/Generic";


export interface InputFieldDecoratorOptions {
  defaultValue?: any;
  description?: string;
  meta?: MetadataStorage;
}

export function InputField(nameAndType: string, options?: InputFieldDecoratorOptions): Function {
  const [ name, typeString ] = nameAndType.split(/\s*:\s*/);

  return function(definitionClass: Function, propertyName: undefined, parameterIndex: number) {
    InputFieldMetadata.create({
      definedOrder: parameterIndex,
      fieldName: name,
      generic: Generic.of(typeString),
      definitionClass: definitionClass,
      description: options && options.description,
      defaultValue: options && options.defaultValue,
      meta: options && options.meta,
    });
  };
}

