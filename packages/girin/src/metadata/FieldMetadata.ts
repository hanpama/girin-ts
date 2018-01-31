import { GraphQLFieldConfig, GraphQLFieldConfigArgumentMap } from "graphql";
import { defaultFieldResolver } from "graphql/execution/execute";

import { MetadataStorage } from "./MetadataStorage";
import { ArgumentMetadata } from "./ArgumentMetadata";
import { InputObjectTypeMetadata } from "./InputObjectTypeMetadata";
import { Generic } from "./Generic";


export interface FieldMetadataConfig {
  definitionClass: Function;
  fieldName: string;

  generic: Generic;

  description?: string;
  deprecationReason?: string;

  meta?: MetadataStorage;
}

export interface FieldMetadataBuild {
  fieldConfig: GraphQLFieldConfig<any, any>;
}

export class FieldMetadata {
  definitionClass: Function;
  meta: MetadataStorage;
  config: FieldMetadataConfig;

  get fieldName() {
    return this.config.fieldName;
  }

  public static create(config: FieldMetadataConfig) {
    const cls = this;
    const metadata = new cls(config);
    metadata.meta.fieldMetadata.push(metadata);
    return metadata;
  }

  protected constructor(config: FieldMetadataConfig) {
    this.definitionClass = config.definitionClass;
    this.meta = config.meta || MetadataStorage.getMetadataStorage();
    this.config = config;
  }

  protected memoizedBuild: FieldMetadataBuild;
  get build() {
    if (!this.memoizedBuild) {
      this.memoizedBuild = {
        fieldConfig: this.buildFieldConfig()
      };
    }
    return this.memoizedBuild;
  }

  protected buildFieldConfig() {
    const argumentMetadata = this.meta.filterArgumentMetadata(this.definitionClass, this.config.fieldName);
    const args = argumentMetadata.reduce((results, metadata) => {
      results[metadata.name] = metadata.build.argumentConfig;
      return results;
    }, {} as GraphQLFieldConfigArgumentMap);

    const { generic, description, deprecationReason } = this.config;
    const type = generic.getTypeInstance();
    const resolve = this.buildResolver();

    const fieldConfig: GraphQLFieldConfig<any, any> = { type, args, description, deprecationReason, resolve };
      // subscribe: this.subscribe,
    return fieldConfig;
  }

  protected buildResolver() {
    // don't have to build resolver if prototype property is not a function
    // TODO: refactor
    if (!this.definitionClass.prototype[this.config.fieldName]) {
      return undefined;
    }
    const argumentMetadata = this.meta.filterArgumentMetadata(this.definitionClass, this.config.fieldName);
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
        argsOrdered[meta.definedOrder] = meta.build.targetMetadata.build.instantiate(args[meta.name], context, info);
      } else {
        argsOrdered[meta.definedOrder] = args[meta.name];
      }
      return argsOrdered;
    }, [] as any[]);
  }
}