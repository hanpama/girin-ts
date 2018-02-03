import { GraphQLFieldConfig, GraphQLFieldConfigArgumentMap } from "graphql";
import { defaultFieldResolver } from "graphql/execution/execute";

import { Generic } from "./Generic";
import { Metadata, MetadataConfig } from "./Metadata";
import { ArgumentMetadata } from "./ArgumentMetadata";
import { InputObjectTypeMetadata } from "./InputObjectTypeMetadata";


export interface FieldMetadataConfig extends MetadataConfig {
  definitionClass: Function;
  fieldName: string;

  generic: Generic;

  description?: string;
  deprecationReason?: string;
}

export interface FieldMetadataBuild {
  fieldConfig: GraphQLFieldConfig<any, any>;
}

export class FieldMetadata extends Metadata<FieldMetadataConfig, FieldMetadataBuild> {

  public get definitionClass() {
    return this.config.definitionClass;
  }
  public get fieldName() {
    return this.config.fieldName;
  }

  protected buildMetadata() {
    const argumentMetadata = this.meta
      .filter(ArgumentMetadata, this.definitionClass)
      .filter(meta => meta.fieldName === this.config.fieldName);

    return { fieldConfig: this.buildFieldConfig(argumentMetadata) };
  }

  protected buildFieldConfig(argumentMetadata: ArgumentMetadata[]) {
    const args = argumentMetadata.reduce((results, metadata) => {
      results[metadata.argumentName] = metadata.build.argumentConfig;
      return results;
    }, {} as GraphQLFieldConfigArgumentMap);

    const { generic, description, deprecationReason } = this.config;
    const type = generic.getTypeInstance();
    const resolve = this.buildResolver(argumentMetadata);

    const fieldConfig: GraphQLFieldConfig<any, any> = { type, args, description, deprecationReason, resolve };
      // subscribe: this.subscribe,
    return fieldConfig;
  }

  protected buildResolver(argumentMetadata: ArgumentMetadata[]) {
    const argumentReducer = this.buildArgumentReducer(argumentMetadata);

    return (definitionInstance: any, args: any, context: any, info: any) => {

      const instance = definitionInstance || this.definitionClass.prototype;
      if (instance[info.fieldName] instanceof Function) {
        const reducedArguments = argumentReducer(args, context, info);
        return instance[info.fieldName](...reducedArguments, context, info);
      }
      return defaultFieldResolver(instance, args, context, info);
    }
  }

  protected buildArgumentReducer(argumentMetadata: ArgumentMetadata[]) {
    return (args: any, context: any, info: any) => argumentMetadata.reduce((argsOrdered, meta, idx) => {
      if (meta.build.targetMetadata instanceof InputObjectTypeMetadata) {
        argsOrdered[meta.definedOrder] = meta.build.targetMetadata.build.instantiate(args[meta.argumentName], context, info);
      } else {
        argsOrdered[meta.definedOrder] = args[meta.argumentName];
      }
      return argsOrdered;
    }, [] as any[]);
  }
}