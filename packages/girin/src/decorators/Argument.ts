import { ArgumentMetadata, ArgumentMetadataConfig } from '../metadata/ArgumentMetadata';
import { Generic } from '../metadata/Generic';
import { globalMetadataStorage } from "../metadata/globalMetadataStorage";


export interface ArgumentDecoratorOptions {
  defaultValue?: any;
  description?: string;
}

export function Argument(nameAndType: string, options?: ArgumentDecoratorOptions) {
  const [argumentName, typeString] = nameAndType.split(/\s*:\s*/);

  return function(target: Object, fieldName: string, parameterIndex: number) {
    const definitionClass = target.constructor;
    const config: ArgumentMetadataConfig = {
      definitionClass,
      fieldName,
      argumentName,
      definedOrder: parameterIndex,
      generic: Generic.of(typeString),
      defaultValue: options && options.defaultValue,
      description: options && options.description,
      meta: globalMetadataStorage,
    };
    ArgumentMetadata.create(config);
  }
}