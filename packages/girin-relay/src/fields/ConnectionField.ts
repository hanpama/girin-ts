import { Field } from "girin/field/Field";
import { MetadataStorage } from "girin/base/MetadataStorage";
import { GraphQLFieldConfigArgumentMap } from "graphql";
import { forwardConnectionArgs, backwardConnectionArgs } from "graphql-relay";


export class ConnectionField extends Field {

  buildArgs(storage: MetadataStorage): GraphQLFieldConfigArgumentMap {
    return {
      ...forwardConnectionArgs,
      ...backwardConnectionArgs,
      ...super.buildArgs(storage),
    };
  }



}
