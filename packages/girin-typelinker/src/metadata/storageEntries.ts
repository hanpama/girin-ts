import { Definition, DefinitionConfig } from "../definition/Definition";
import { TypeExpression } from "../type-expression/TypeExpression";
import { Field, InputField } from "../field";


export class Entry<T> {
  constructor(protected __properties?: Partial<T>) {}

  @property public definitionClass: Function;
}

export class DefinitionEntry<T extends Definition<U>, U extends DefinitionConfig> extends Entry<DefinitionEntry<T, U>> {
  @property public metadata: T;
}

export class FieldReferenceEntry extends Entry<FieldReferenceEntry> {
  @property public field: Field;
}

export class FieldMixinEntry extends Entry<FieldMixinEntry> {
  @property public extendingTypeName: string;
  @property public field: Field;
}

export class InputFieldReferenceEntry extends Entry<InputFieldReferenceEntry>{
  @property public field: InputField;
}

export class InputFieldMixinEntry extends Entry<InputFieldMixinEntry>{
  @property public extendingTypeName: string;
  @property public field: InputField;
}

export class ImplementReferenceEntry extends Entry<ImplementReferenceEntry> {
  @property public interfaceType: TypeExpression;
}

export class ImplementMixinEntry extends Entry<ImplementMixinEntry> {
  @property public extendingTypeName: string;
  @property public interfaceType: TypeExpression;
}

export type ReferenceEntry = FieldReferenceEntry | InputFieldReferenceEntry | ImplementReferenceEntry;
export type MixinEntry = FieldMixinEntry | InputFieldMixinEntry | ImplementMixinEntry;


export function property(prototype: any, propertyKey: string) {
  const get = function() {
    return this.__properties[propertyKey];
  }
  const set = function(value: any) {
    this.__properties[propertyKey] = value;
  }
  Object.defineProperty(prototype, propertyKey, { get, set });
}
