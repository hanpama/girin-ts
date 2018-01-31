import { GraphQLBoolean, GraphQLString, GraphQLInt, GraphQLFloat, GraphQLID } from "graphql/type/scalars";
import { GraphQLScalarType } from "graphql";


export class ScalarMetadata {
  protected typeInstance: GraphQLScalarType;
  public name: string
  public definitionClass: Function;

  constructor(typeInstance: GraphQLScalarType) {
    this.typeInstance = typeInstance;
    this.name = typeInstance.name;
  }

  get build() {
    return { typeInstance: this.typeInstance };
  }
}


export const builtInScalarMetadata = [
  GraphQLBoolean,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLID,
].map(type => new ScalarMetadata(type));
