import { GraphQLFieldConfig, GraphQLFieldConfigArgumentMap, GraphQLOutputType } from "graphql";
import { defaultFieldResolver } from "graphql/execution/execute";

import { ArgumentMetadata } from "./ArgumentMetadata";
import { GenericMetadata, GenericMetadataConfig } from "../base/GenericMetadata";
import { isPromise } from "../types";


export interface FieldMetadataConfig extends GenericMetadataConfig {
  fieldName: string;
  description?: string;
  deprecationReason?: string;
  resolver?: Function;
}

/**
 * Metadata type for fields
 */
export class FieldMetadata extends GenericMetadata<FieldMetadataConfig> {

  public get fieldName() {
    return this.config.fieldName;
  }

  protected findArgumentMetadata(): ArgumentMetadata[] {
    return this.storage
      .filter(ArgumentMetadata, this.definitionClass)
      .filter(meta => meta.fieldName === this.config.fieldName);
  }

  public get fieldConfig() {
    const argumentMetadata = this.findArgumentMetadata();
    const type = this.type as GraphQLOutputType;
    const resolve = this.resolve;

    const args = argumentMetadata.reduce((results, metadataObj) => {
      results[metadataObj.argumentName] = metadataObj.argumentConfig;
      return results;
    }, {} as GraphQLFieldConfigArgumentMap);

    const { description, deprecationReason } = this.config;

    const fieldConfig: GraphQLFieldConfig<any, any> = { type, args, description, deprecationReason, resolve };
    return fieldConfig;
  }

  protected get completeArguments() {
    const argumentMetadata = this.findArgumentMetadata();
    return (args: any, context: any, info: any) => argumentMetadata.reduce((completeArgs, meta) => {
      completeArgs[meta.argumentName] = meta.instantiate(args[meta.argumentName], context, info);
      return completeArgs;
    }, {} as any);
  }

  public get resolve() {
    const { resolver, definitionClass } = this.config;
    const { completeArguments, instantiate } = this;

    return (source: any, args: any, context: any, info: any) => {
      const completeArgs = completeArguments(args, context, info);
      let resolved: any;
      if (resolver) {
        resolved = resolver.apply(definitionClass, [source, completeArgs, context, info]);
      } else if (source) {
        resolved = defaultFieldResolver(source, completeArgs, context, info);
      } else {
        return source;
      }

      if (!resolved) {
        return resolved;
      } else if (isPromise(resolved)) {
        return resolved.then(instantiate);
      }
      return instantiate(resolved);
    }
  }
}
