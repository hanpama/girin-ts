import { ArgumentMetadata } from '../metadata/ArgumentMetadata';
import { Generic } from '../metadata/Generic';


export interface ArgumentDecoratorOptions {
  defaultValue?: any;
  description?: string;
}

export function Argument(nameAndType: string, options?: ArgumentDecoratorOptions) {
  const [name, typeString] = nameAndType.split(/\s*:\s*/);

  return function(target: Object, fieldName: string, parameterIndex: number) {
    const definitionClass = target.constructor;
    ArgumentMetadata.create({
      definitionClass,
      fieldName,
      name,
      definedOrder: parameterIndex,
      generic: Generic.of(typeString),
      defaultValue: options && options.defaultValue,
      description: options && options.description,
    });
  }
}