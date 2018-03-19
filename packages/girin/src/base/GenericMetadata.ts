import { MetadataConfig, Metadata } from "./Metadata";

import { GraphQLType } from "graphql";
import { TypeExpression } from '../type-expression/TypeExpression';
import { Instantiator } from "../types";

export interface GenericMetadataConfig extends MetadataConfig {
  typeExpression: TypeExpression;
  description?: string;
}

export class GenericMetadata<TConfig extends GenericMetadataConfig = GenericMetadataConfig> extends Metadata<TConfig> {

  // public get typeExpression() {
  //   return this.config.typeExpression;
  // }

  // public get description() {
  //   return this.config.description;
  // }

  // public get targetMetadata(): DefinitionMetadata | undefined {
  //   const { typeExpression } = this.config;
  //   const { storage } = this;
  //   return typeExpression.resolveDefinitionMetadata(storage);
  // }

  public get type(): GraphQLType {
    const { typeExpression } = this.config;
    const { storage } = this;
    return typeExpression.buildTypeInstance(storage);
  }

  public get instantiate(): Instantiator {
    const { typeExpression } = this.config;
    const { storage } = this;
    return typeExpression.buildInstantiator(storage);
  }
}
