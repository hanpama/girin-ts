import { GraphQLSchemaConfig, GraphQLNamedType } from "graphql";
import { Module } from "@girin/environment";
import { TypeArg, getGraphQLType } from "@girin/typelinker";
import { GraphQLSchema } from "graphql";
import { GraphQLDirective } from "graphql";


export interface SchemaModuleConfigs {
  Query: TypeArg;
  Mutation?: TypeArg;
  Subscription?: TypeArg;
  types?: TypeArg[];
}

export default class SchemaModule extends Module<SchemaModuleConfigs, GraphQLSchema> {
  public schemaOptions: GraphQLSchemaConfig & {
    types: GraphQLNamedType[],
    directives: GraphQLDirective[],
  };

  configure() {
    const { configs } = this;

    const query = getGraphQLType(configs.Query);
    const mutation = configs.Mutation && getGraphQLType(configs.Mutation);
    const subscription = configs.Subscription && getGraphQLType(configs.Subscription);

    const types: GraphQLNamedType[] = configs.types ? configs.types.map(arg => getGraphQLType(arg)) : [];
    const directives: GraphQLDirective[] = [];

    if (query) { types.push(query); }
    if (mutation) { types.push(mutation); }
    if (subscription) { types.push(subscription); }

    this.schemaOptions = { query, mutation, subscription, types, directives };
  }

  bootstrap(): GraphQLSchema {
    return new GraphQLSchema(this.schemaOptions);
  }
}
