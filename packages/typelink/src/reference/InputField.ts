import { GraphQLInputType } from 'graphql';
import { TypeExpression } from '../type-expression';
import { MetadataStorage, Reference } from '../metadata';


export interface InputFieldConfig {
  type: TypeExpression;
  fieldName: string;
  defaultValue?: any;
  description?: string;
  directives?: any;
  extendingTypeName?: string;
}

export class InputField<TConfig extends InputFieldConfig = InputFieldConfig> extends Reference<TConfig> {
  public get fieldName() { return this.config.fieldName; }
  public get defaultValue() { return this.config.defaultValue; }
  public get description() { return this.config.description; }
  public get directives() { return this.config.directives; }
  public get extendingTypeName() { return this.config.extendingTypeName; }

  public buildType(storage: MetadataStorage, targetClass?: Function): GraphQLInputType {
    return this.config.type.getTypeInstance(storage) as GraphQLInputType;
  }

  public buildInstantiator(storage: MetadataStorage, targetClass?: Function) {
    return this.config.type.getInstantiator(storage);
  }
}
