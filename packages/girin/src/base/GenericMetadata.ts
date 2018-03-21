import { MetadataConfig, Metadata } from "./Metadata";

import { GraphQLType } from "graphql";
import { TypeExpression } from '../type-expression/TypeExpression';
import { Instantiator } from "../types";

export interface GenericMetadataConfig extends MetadataConfig {
  typeExpression: TypeExpression;
  description?: string;
}

/**
 * Contain [[TypeExpression]] object which is a reference to a GraphQL definition.
 * Resolve [[TypeExpression]]'s target instance with [[MetadataStorage]].
 */
export class GenericMetadata<TConfig extends GenericMetadataConfig = GenericMetadataConfig> extends Metadata<TConfig> {

  /**
   * The target GraphQLType instance.
   */
  public get type(): GraphQLType {
    const { typeExpression } = this.config;
    const { storage } = this;
    return typeExpression.buildTypeInstance(storage);
  }

  /**
   * The function to instantiate this target definition class.
   */
  public get instantiate(): Instantiator {
    const { typeExpression } = this.config;
    const { storage } = this;
    return typeExpression.buildInstantiator(storage);
  }
}
