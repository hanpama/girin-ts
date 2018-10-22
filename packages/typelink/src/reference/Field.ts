import { GraphQLFieldConfigArgumentMap, GraphQLOutputType, GraphQLFieldResolver, defaultFieldResolver } from 'graphql';

import { TypeExpression } from '../type-expression';
import { InputField } from './InputField';
import { MetadataStorage, Reference } from '../metadata';


export interface FieldConfig {
  fieldName: string;
  type: TypeExpression;
  args: InputField[];
  description?: string;
  deprecationReason?: string;
  directives?: any;
  extendingTypeName?: string;
}

export class Field<TConfig extends FieldConfig = FieldConfig> extends Reference<TConfig> {

  public get fieldName() { return this.config.fieldName; }
  public get description() { return this.config.description; }
  public get deprecationReason() { return this.config.deprecationReason; }
  public get extendingTypeName() { return this.config.extendingTypeName; }

  public buildArgs(storage: MetadataStorage, definitionClass: Function): GraphQLFieldConfigArgumentMap {
    const { args } = this.config;
    return args.reduce((args, ref) => {
      args[ref.fieldName] = {
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

    const maybeStaticResolver = (definitionClass as any)[this.fieldName];
    const innerResolver = maybeStaticResolver instanceof Function
      ? maybeStaticResolver.bind(definitionClass)
      : defaultFieldResolver;

    const instantiators = args.reduce((res, meta) => {
      res[meta.fieldName] = meta.buildInstantiator(storage);
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
    };
    return resolver;
  }
}
