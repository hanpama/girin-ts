import { GraphQLString, GraphQLBoolean, GraphQLFloat, GraphQLInt, GraphQLID } from "graphql";
import { ScalarMetadata } from "../metadata/ScalarMetadata";
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
  storage.register(new ScalarMetadata({ typeInstance: GraphQLString }), StringScalar);
  storage.register(new ScalarMetadata({ typeInstance: GraphQLBoolean }), BooleanScalar);
  storage.register(new ScalarMetadata({ typeInstance: GraphQLFloat }), FloatScalar);
  storage.register(new ScalarMetadata({ typeInstance: GraphQLInt }), IntScalar);
  storage.register(new ScalarMetadata({ typeInstance: GraphQLID }), IDScalar);
}
