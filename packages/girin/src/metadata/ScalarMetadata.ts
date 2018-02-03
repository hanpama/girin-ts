import { GraphQLBoolean, GraphQLString, GraphQLInt, GraphQLFloat, GraphQLID } from "graphql/type/scalars";
import { GraphQLScalarType } from "graphql";
import { Metadata, MetadataConfig } from "./Metadata";
import { MetadataStorage } from "../index";


export interface ScalarMetadataConfig extends MetadataConfig {
  definitionClass: any;
  typeInstance: GraphQLScalarType;
}

export interface ScalarMetadataBuild {
  typeInstance: GraphQLScalarType;
}

export class ScalarMetadata extends Metadata<ScalarMetadataConfig, ScalarMetadataBuild> {

  get name() {
    return this.config.typeInstance.name;
  }

  buildMetadata() {
    return { typeInstance: this.config.typeInstance };
  }
}

export function createScalarMetadata(meta: MetadataStorage) {
  const definitionClass = GraphQLScalarType;
  [
    GraphQLBoolean,
    GraphQLString,
    GraphQLInt,
    GraphQLFloat,
    GraphQLID,
  ].forEach(typeInstance => {
    const config: ScalarMetadataConfig = { meta, definitionClass, typeInstance };
    ScalarMetadata.create(config);
  });
}
