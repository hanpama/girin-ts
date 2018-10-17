import { GraphQLScalarType, GraphQLString, GraphQLBoolean, GraphQLFloat, GraphQLInt, GraphQLID } from 'graphql';

import { Definition, DefinitionConfig } from './Definition';
import { MetadataStorage, DefinitionEntry } from '../metadata';


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

  storage.registerEntry(StringScalar, new DefinitionEntry({
    metadata: new ScalarType({ typeInstance: GraphQLString }),
  }));
  storage.registerEntry(BooleanScalar, new DefinitionEntry({
    metadata: new ScalarType({ typeInstance: GraphQLBoolean }),
  }));
  storage.registerEntry(FloatScalar, new DefinitionEntry({
    metadata: new ScalarType({ typeInstance: GraphQLFloat }),
  }));
  storage.registerEntry(IntScalar, new DefinitionEntry({
    metadata: new ScalarType({ typeInstance: GraphQLInt }),
  }));
  storage.registerEntry(IDScalar, new DefinitionEntry({
    metadata: new ScalarType({ typeInstance: GraphQLID }),
  }));
}
