import { GraphQLScalarType, GraphQLString, GraphQLBoolean, GraphQLFloat, GraphQLInt, GraphQLID } from "graphql";

import { Definition, DefinitionConfig } from "./Definition";
import { MetadataStorage } from "./MetadataStorage";


export interface ScalarTypeConfig extends DefinitionConfig {
  typeInstance: GraphQLScalarType;
}

/**
 * Metadata type for ScalarType
 */
export class ScalarType<T extends ScalarTypeConfig = ScalarTypeConfig> extends Definition<T> {
  public isOutputType() { return true; }
  public isInputType() { return true; }

  public get typeName(): string {
    return this.config.typeInstance.name;
  }

  public buildTypeInstance() {
    return this.config.typeInstance;
  }
}

export class StringScalar {}
export class BooleanScalar {}
export class FloatScalar {}
export class IntScalar {}
export class IDScalar {}

/**
 * Load all the built in scalar types into a given [[MetadataStorage]].
 * @param storage
 */
export function loadBuiltInScalar(storage: MetadataStorage) {
  storage.register(new ScalarType({ typeInstance: GraphQLString }), StringScalar);
  storage.register(new ScalarType({ typeInstance: GraphQLBoolean }), BooleanScalar);
  storage.register(new ScalarType({ typeInstance: GraphQLFloat }), FloatScalar);
  storage.register(new ScalarType({ typeInstance: GraphQLInt }), IntScalar);
  storage.register(new ScalarType({ typeInstance: GraphQLID }), IDScalar);
}
