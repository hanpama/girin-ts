import { GraphQLArgumentConfig } from "graphql";

import { Metadata, MetadataConfig } from "./Metadata";
import { Generic } from "./Generic";
import { InputMetadata } from "./types";


export interface ArgumentMetadataConfig extends MetadataConfig {
  fieldName: string;
  definedOrder: number;
  argumentName: string;

  generic: Generic;
  defaultValue?: any;
  description?: string;
  definitionClass: Function;
}

export interface ArgumentMetadataBuild {
  argumentConfig: GraphQLArgumentConfig,
  targetMetadata: InputMetadata,
}

export class ArgumentMetadata extends Metadata<ArgumentMetadataConfig, ArgumentMetadataBuild> {

  public get definitionClass() {
    return this.config.definitionClass;
  }
  public get argumentName() {
    return this.config.argumentName;
  }
  public get fieldName() {
    return this.config.fieldName;
  }
  public get definedOrder() {
    return this.config.definedOrder;
  }

  protected buildMetadata() {
    return {
      argumentConfig: this.buildArgumentConfig(),
      targetMetadata: this.config.generic.getTargetMetadata(),
    }
  }

  protected buildArgumentConfig(): GraphQLArgumentConfig {
    const { generic, defaultValue, description } = this.config;
    const type = generic.getTypeInstance();
    return { type, defaultValue, description };
  }
}
