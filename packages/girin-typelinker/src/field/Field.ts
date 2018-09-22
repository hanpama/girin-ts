import { GraphQLFieldConfigArgumentMap, GraphQLOutputType, GraphQLFieldResolver, defaultFieldResolver } from "graphql";

import { TypeExpression } from "../type-expression";
import { InputField } from "./InputField";
import { MetadataStorage } from "../metadata";


export interface FieldConfig {
  defaultName: string;
  type: TypeExpression;
  args: InputField[];
  description?: string;
  deprecationReason?: string;
  directives?: any;
}

export class Field<TConfig extends FieldConfig = FieldConfig> {
  constructor(public readonly config: TConfig) { }

  public get defaultName() { return this.config.defaultName; };
  public get description() { return this.config.description; };
  public get deprecationReason() { return this.config.deprecationReason; };

  public buildArgs(storage: MetadataStorage, definitionClass: Function): GraphQLFieldConfigArgumentMap {
    const { args } = this.config;
    return args.reduce((args, ref) => {
      args[ref.defaultName] = {
        type: ref.buildType(storage, definitionClass),
        defaultValue: ref.defaultValue,
        description: ref.description,
      };
      return args;
    }, {} as GraphQLFieldConfigArgumentMap);
  }

  public buildType(storage: MetadataStorage, definitionClass: Function): GraphQLOutputType {
    return this.config.type.getTypeInstance(storage) as GraphQLOutputType;
  }

  public buildResolver(storage: MetadataStorage, definitionClass: Function): GraphQLFieldResolver<any, any> {
    const { args } = this.config;

    const maybeStaticResolver = (definitionClass as any)[this.defaultName];
    const innerResolver = maybeStaticResolver instanceof Function
      ? maybeStaticResolver.bind(definitionClass)
      : defaultFieldResolver;

    const instantiators = args.reduce((res, meta) => {
      res[meta.defaultName] = meta.buildInstantiator(storage);
      return res;
    }, {} as any);

    const argumentInstantiator = (argValues: any) => {
      return Object.keys(argValues).reduce((res, fieldName) => {
        res[fieldName] = instantiators[fieldName](argValues[fieldName]);
        return res;
      }, {} as any);
    };

    const resolver = function(source: any, args: any, context: any, info: any) {
      return innerResolver(source, argumentInstantiator(args), context, info);
    }
    return resolver;
  }
}
