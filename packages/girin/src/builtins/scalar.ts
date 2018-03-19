import { GraphQLString, GraphQLBoolean, GraphQLFloat, GraphQLInt, GraphQLID } from "graphql/type/scalars";
import { ScalarMetadata } from "../metadata/ScalarMetadata";
import { MetadataStorage } from "../base/MetadataStorage";


export class StringScalar {}
export class BooleanScalar {}
export class FloatScalar {}
export class IntScalar {}
export class IDScalar {}


export function loadBuiltInScalar(storage: MetadataStorage) {
  (new ScalarMetadata({
    definitionClass: StringScalar,
    typeInstance: GraphQLString,
  })).registerToStorage(storage);

  (new ScalarMetadata({
    definitionClass: BooleanScalar,
    typeInstance: GraphQLBoolean,
  })).registerToStorage(storage);

  (new ScalarMetadata({
    definitionClass: FloatScalar,
    typeInstance: GraphQLFloat,
  })).registerToStorage(storage);

  (new ScalarMetadata({
    definitionClass: IntScalar,
    typeInstance: GraphQLInt,
  })).registerToStorage(storage);

  (new ScalarMetadata({
    definitionClass: IDScalar,
    typeInstance: GraphQLID,
  })).registerToStorage(storage);
}