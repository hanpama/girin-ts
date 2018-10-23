import { MetadataStorage, Reference, ReferenceConfig } from '../metadata';


export interface InputFieldConfig extends ReferenceConfig {
  fieldName: string;
  defaultValue?: any;
  description?: string;
  directives?: any;
}

export class InputField<TConfig extends InputFieldConfig = InputFieldConfig> extends Reference<TConfig> {
  public get fieldName() { return this.config.fieldName; }
  public get defaultValue() { return this.config.defaultValue; }
  public get description() { return this.config.description; }
  public get directives() { return this.config.directives; }
  public get extendingTypeName() { return this.config.extendingTypeName; }

  // override
  public resolveType(storage: MetadataStorage) {
    return this.targetType.getType(storage, 'input');
  }

  public buildInstantiator(storage: MetadataStorage) {
    return this.targetType.getInstantiator(storage, 'input');
  }
}
