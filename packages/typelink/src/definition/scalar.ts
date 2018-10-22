import { GraphQLScalarType, GraphQLString, GraphQLBoolean, GraphQLFloat, GraphQLInt, GraphQLID } from 'graphql';

import { Definition, DefinitionConfig, MetadataStorage } from '../metadata';


export interface ScalarTypeConfig extends DefinitionConfig {
  typeInstance: GraphQLScalarType;
}

/**
 * Metadata type for ScalarType
 */
export class ScalarType<T extends ScalarTypeConfig = ScalarTypeConfig> extends Definition<T> {
  public isOutputType() { return true; }
  public isInputType() { return true; }


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
  storage.register(StringScalar, () => [ new ScalarType({
    definitionName: 'String',
    typeInstance: GraphQLString,
  }) ]);
  storage.register(BooleanScalar, () => [ new ScalarType({
    definitionName: 'Boolean',
    typeInstance: GraphQLBoolean,
  }) ]);
  storage.register(FloatScalar, () => [ new ScalarType({
    definitionName: 'Float',
    typeInstance: GraphQLFloat,
  }) ]);
  storage.register(IntScalar, () => [ new ScalarType({
    definitionName: 'Int',
    typeInstance: GraphQLInt,
  }) ]);
  storage.register(IDScalar, () => [ new ScalarType({
    definitionName: 'ID',
    typeInstance: GraphQLID,
  }) ]);
}
