import { GraphQLString, GraphQLBoolean, GraphQLFloat, GraphQLInt, GraphQLID } from "graphql";
import { ScalarType } from "../metadata/ScalarType";
import { MetadataStorage } from "../base/MetadataStorage";


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
