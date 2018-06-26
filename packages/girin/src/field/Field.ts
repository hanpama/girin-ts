import { GraphQLFieldConfigArgumentMap, GraphQLOutputType, GraphQLFieldResolver } from "graphql";
import { TypeExpression } from "../type-expression/TypeExpression";
import { MetadataStorage } from "../base/MetadataStorage";
import { InputField } from "./InputField";


export interface FieldConfig {
  defaultName: string;
  type: TypeExpression;
  args: InputField[];
  description?: string;
  deprecationReason?: string;
  directives?: any;
}

export class Field<TConfig extends FieldConfig = FieldConfig> {
  constructor(protected config: TConfig) { }

  public get defaultName() { return this.config.defaultName; };
  public get description() { return this.config.description; };
  public get deprecationReason() { return this.config.deprecationReason; };

  public buildArgs(storage: MetadataStorage, targetClass?: Function): GraphQLFieldConfigArgumentMap {
    const { args } = this.config;
    return args.reduce((args, ref) => {
      args[ref.defaultName] = {
        type: ref.buildType(storage, targetClass),
        defaultValue: ref.defaultValue,
        description: ref.description,
      };
      return args;
    }, {} as GraphQLFieldConfigArgumentMap);
  }

  public buildType(storage: MetadataStorage, targetClass?: Function): GraphQLOutputType {
    return this.config.type.buildTypeInstance(storage, targetClass) as GraphQLOutputType;
  }
}

export class FieldMount {
  public field: Field;
  public mountName: string;
  public resolver?: GraphQLFieldResolver<any, any>;

  constructor(values: FieldMount) { Object.assign(this, values); }
}
