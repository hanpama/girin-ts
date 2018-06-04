import { GraphQLInputFieldConfig, GraphQLInputType } from "graphql";
import { TypeExpression, TypeArg } from "../type-expression/TypeExpression";
import { MetadataStorage } from "../base/MetadataStorage";


export interface InputFieldProps {
  defaultValue?: any;
  description?: string;
  directives?: any;
}

export interface InputFieldReference {
  name: string;
  field: InputField;
  props: InputFieldProps;
}

export class InputField {

  protected input: TypeExpression;

  constructor(input?: TypeArg | TypeExpression) {
    if (input) {
      this.input = input instanceof TypeExpression ? input : new TypeExpression(input);
    }
  }

  public buildConfig(storage: MetadataStorage): GraphQLInputFieldConfig {
    const { input } = this;
    return {
      type: input.buildTypeInstance(storage) as GraphQLInputType,
    };
  }
}
