import { Reference, ReferenceConfig } from '../metadata/Reference';


export interface InputFieldConfig extends ReferenceConfig {
  fieldName: string;
  defaultValue?: any;
  description?: string;
  directives?: any;
}

export class InputField<TConfig extends InputFieldConfig = InputFieldConfig> extends Reference<TConfig> {
  protected get kind(): 'input' { return 'input'; }

  public get fieldName() { return this.config.fieldName; }
  public get defaultValue() { return this.config.defaultValue; }
  public get description() { return this.config.description; }
  public get directives() { return this.config.directives; }
}
