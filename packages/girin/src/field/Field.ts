import { GraphQLFieldConfigArgumentMap, GraphQLFieldConfig, GraphQLOutputType, GraphQLFieldResolver } from "graphql";
import { TypeExpression, TypeArg } from "../type-expression/TypeExpression";
import { MetadataStorage } from "../base/MetadataStorage";
import { InputFieldReference } from "./InputField";


export interface FieldProps {
  description?: string;
  deprecationReason?: string;
  directives?: any;
  resolve?: Function;
}

export interface FieldReference {
  name: string;
  field: Field;
  props: FieldProps;
}

export class Field {

  protected output: TypeExpression;
  protected args: InputFieldReference[];

  constructor(
    output?: TypeArg | TypeExpression,
    args?: InputFieldReference[],
  ) {
    if (output) {
      this.output = output instanceof TypeExpression ? output : new TypeExpression(output);
    }
    this.args = args || [];;
  }


  public buildResolver(storage: MetadataStorage): GraphQLFieldResolver<any, any> | undefined  {
    return undefined;
  }

  public buildArgs(storage: MetadataStorage): GraphQLFieldConfigArgumentMap {
    const { args } = this;
    return args.reduce((args, ref) => {
      args[ref.name] = Object.assign(ref.field.buildConfig(storage), ref.props);
      return args;
    }, {} as GraphQLFieldConfigArgumentMap);
  }

  public buildConfig(storage: MetadataStorage): GraphQLFieldConfig<any, any> {
    const { output } = this;

    return {
      type: output.buildTypeInstance(storage) as GraphQLOutputType,
      args: this.buildArgs(storage),
      resolve: this.buildResolver(storage),
    };
  }
}
