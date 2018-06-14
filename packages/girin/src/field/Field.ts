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

export class FieldReference {
  constructor(
    public name: string,
    public field: Field,
    public props: FieldProps,
  ) { }
}

export interface FieldBuilder {
  output: TypeArg | TypeExpression;
  args: InputFieldReference[];
  buildResolver?(storage: MetadataStorage): GraphQLFieldResolver<any, any> | undefined;
  buildArgs?(storage: MetadataStorage): GraphQLFieldConfigArgumentMap;
  buildConfig?(storage: MetadataStorage): GraphQLFieldConfig<any, any>
}

export class Field implements FieldBuilder {

  constructor(builder?: FieldBuilder) {
    if (builder) { Object.assign(this, builder); }
  }

  public output: TypeExpression;
  public args: InputFieldReference[];

  public mountAs(fieldName: string, props?: FieldProps) {
    return new FieldReference(fieldName, this, props || {});
  }

  public buildResolver(storage: MetadataStorage): GraphQLFieldResolver<any, any> | undefined  {
    return;
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
