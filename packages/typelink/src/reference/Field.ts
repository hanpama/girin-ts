import { GraphQLFieldConfigArgumentMap, GraphQLInputType, GraphQLFieldResolver, defaultFieldResolver } from 'graphql';

import { InputField } from './InputField';
import { MetadataStorage, Reference, ReferenceConfig } from '../metadata';


export interface FieldConfig extends ReferenceConfig {
  fieldName: string;
  args: InputField[];
  description?: string;
  deprecationReason?: string;
  directives?: any;
}

export class Field<TConfig extends FieldConfig = FieldConfig> extends Reference<TConfig> {

  public get fieldName() { return this.config.fieldName; }
  public get description() { return this.config.description; }
  public get deprecationReason() { return this.config.deprecationReason; }
  public get extendingTypeName() { return this.config.extendingTypeName; }

  // override
  public resolveType(storage: MetadataStorage) {
    return this.targetType.getType(storage, 'output');
  }

  public buildArgs(storage: MetadataStorage): GraphQLFieldConfigArgumentMap {
    const { args } = this.config;
    return args.reduce((args, ref) => {
      args[ref.fieldName] = {
        type: ref.resolveType(storage) as GraphQLInputType,
        defaultValue: ref.defaultValue,
        description: ref.description,
      };
      return args;
    }, {} as GraphQLFieldConfigArgumentMap);
  }

  public buildResolver(storage: MetadataStorage): GraphQLFieldResolver<any, any> {
    const { args } = this.config;
    const { definitionClass } = this;

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