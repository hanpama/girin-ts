import { GraphQLInputType } from "graphql";
import { TypeExpression, MetadataStorage } from "..";


export interface InputFieldConfig {
  type: TypeExpression;
  defaultName: string;
  defaultValue?: any;
  description?: string;
  directives?: any;
}

export class InputField<TConfig extends InputFieldConfig = InputFieldConfig> {
  constructor(protected config: TConfig) { }

  public get defaultName() { return this.config.defaultName; }
  public get defaultValue() { return this.config.defaultValue; }
  public get description() { return this.config.description; }
  public get directives() { return this.config.directives; }

  public buildType(storage: MetadataStorage, targetClass?: Function): GraphQLInputType {
    return this.config.type.buildTypeInstance(storage, targetClass) as GraphQLInputType;
  }
}
