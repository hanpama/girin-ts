import { GraphQLFieldConfigArgumentMap, GraphQLInputType, GraphQLFieldResolver } from 'graphql';

import { InputField } from './InputField';
import { Reference, ReferenceConfig } from '../metadata/Reference';
import { TypeResolvingContext } from '../type-expression/types';


export interface FieldConfig extends ReferenceConfig {
  fieldName: string;
  args: InputField[];
  description?: string;
  deprecationReason?: string;
  directives?: any;
  resolver: GraphQLFieldResolver<any, any>;
}

export class Field<TConfig extends FieldConfig = FieldConfig> extends Reference<TConfig> {
  protected get kind(): 'output' { return 'output'; }

  public get fieldName() { return this.config.fieldName; }
  public get description() { return this.config.description; }
  public get deprecationReason() { return this.config.deprecationReason; }
  public get resolver() { return this.config.resolver; }

  public buildArgumentMap(context: TypeResolvingContext): GraphQLFieldConfigArgumentMap {
    const { args } = this.config;
    return args.reduce((args, ref) => {
      args[ref.fieldName] = {
        type: ref.resolveType(context.storage) as GraphQLInputType,
        defaultValue: ref.defaultValue,
        description: ref.description,
      };
      return args;
    }, {} as GraphQLFieldConfigArgumentMap);
  }

  public buildResolver(context: TypeResolvingContext): GraphQLFieldResolver<any, any> {
    const { args, resolver } = this.config;

    const instantiators = args.reduce((res, meta) => {
      res[meta.fieldName] = meta.buildInstantiator(context.storage);
      return res;
    }, {} as any);

    const argumentInstantiator = (argValues: any) => {
      return Object.keys(argValues).reduce((res, fieldName) => {
        res[fieldName] = instantiators[fieldName](argValues[fieldName]);
        return res;
      }, {} as any);
    };

    const finalResolver = function(source: any, args: any, context: any, info: any) {
      return resolver(source, argumentInstantiator(args), context, info);
    };
    return finalResolver;
  }
}
