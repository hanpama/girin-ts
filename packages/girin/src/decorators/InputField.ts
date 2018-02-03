import { InputFieldMetadata } from "../metadata/InputFieldMetadata";
import { Generic } from "../metadata/Generic";
import { globalMetadataStorage } from "../metadata/globalMetadataStorage";


export interface InputFieldDecoratorOptions {
  defaultValue?: any;
  description?: string;
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
      meta: globalMetadataStorage,
    });
  };
}

