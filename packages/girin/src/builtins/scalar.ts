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
  (new ScalarMetadata(StringScalar, { typeInstance: GraphQLString })).registerToStorage(storage);
  (new ScalarMetadata(BooleanScalar, { typeInstance: GraphQLBoolean })).registerToStorage(storage);
  (new ScalarMetadata(FloatScalar, { typeInstance: GraphQLFloat })).registerToStorage(storage);
  (new ScalarMetadata(IntScalar, { typeInstance: GraphQLInt })).registerToStorage(storage);
  (new ScalarMetadata(IDScalar, { typeInstance: GraphQLID })).registerToStorage(storage);
}
