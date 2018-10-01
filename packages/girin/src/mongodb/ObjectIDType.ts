import { GraphQLScalarType } from "graphql";
import { ObjectID as BsonObjectID } from "bson";


export const ObjectIDType = new GraphQLScalarType({
  name: 'ObjectID',
  description: 'BSON ObjectID type',
  serialize(value: BsonObjectID) {
    return value.toHexString();
  },
  parseValue(value: string) {
    return new BsonObjectID(value);
  },
  parseLiteral(node: any) {
    return new BsonObjectID(node.value);
  }
});
