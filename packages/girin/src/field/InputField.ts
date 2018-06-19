import { GraphQLInputFieldConfig, GraphQLInputType } from "graphql";
import { TypeExpression, TypeArg } from "../type-expression/TypeExpression";
import { MetadataStorage } from "../base/MetadataStorage";
import { DefinitionClass } from "../types";


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

  public buildConfig(storage: MetadataStorage, definitionClass: DefinitionClass): GraphQLInputFieldConfig {
    const { input } = this;
    return {
      type: input.buildTypeInstance(storage, definitionClass) as GraphQLInputType,
    };
  }
}
