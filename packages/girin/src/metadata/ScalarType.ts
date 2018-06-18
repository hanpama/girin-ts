import { GraphQLScalarType } from "graphql";

import { Definition, DefinitionConfig } from "../base/Definition";


export interface ScalarTypeConfig extends DefinitionConfig {
  typeInstance: GraphQLScalarType;
}

/**
 * Metadata type for ScalarType
 */
export class ScalarType<T extends ScalarTypeConfig = ScalarTypeConfig> extends Definition<T> {
  public get typeName(): string {
    return this.config.typeInstance.name;
  }

  public buildTypeInstance() {
    return this.config.typeInstance;
  }
}
