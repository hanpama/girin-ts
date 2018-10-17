import { GraphQLInputType } from 'graphql';
import { TypeExpression } from '../type-expression';
import { MetadataStorage } from '../metadata';


export interface InputFieldConfig {
  type: TypeExpression;
  defaultName: string;
  defaultValue?: any;
  description?: string;
  directives?: any;
}

export class InputField<TConfig extends InputFieldConfig = InputFieldConfig> {
  constructor(public readonly config: TConfig) { }

  public get defaultName() { return this.config.defaultName; }
  public get defaultValue() { return this.config.defaultValue; }
  public get description() { return this.config.description; }
  public get directives() { return this.config.directives; }

  public buildType(storage: MetadataStorage, targetClass?: Function): GraphQLInputType {
    return this.config.type.getTypeInstance(storage) as GraphQLInputType;
  }

  public buildInstantiator(storage: MetadataStorage, targetClass?: Function) {
    return this.config.type.getInstantiator(storage);
  }
}
