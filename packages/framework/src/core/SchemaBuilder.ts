import { Module } from '@girin/environment';
import { GraphQLSchemaConfig, GraphQLNamedType } from 'graphql';
import { TypeArg, getType } from '@girin/typelink';
import { GraphQLSchema } from 'graphql';
import { GraphQLDirective } from 'graphql';


export interface SchemaBuilderConfigs {
  Query: TypeArg;
  Mutation?: TypeArg;
  Subscription?: TypeArg;
  types?: TypeArg[];
}

export class SchemaBuilder extends Module {
  get label() { return 'SchemaBuilder'; }

  public schemaOptions: GraphQLSchemaConfig & {
    types: GraphQLNamedType[],
    directives: GraphQLDirective[],
  };

  constructor(public configs: SchemaBuilderConfigs) {
    super();
    const query = getType(configs.Query);
    const mutation = configs.Mutation && getType(configs.Mutation);
    const subscription = configs.Subscription && getType(configs.Subscription);

    const types: GraphQLNamedType[] = configs.types ? configs.types.map(arg => getType(arg)) : [];
    const directives: GraphQLDirective[] = [];

    if (query) { types.push(query); }
    if (mutation) { types.push(mutation); }
    if (subscription) { types.push(subscription); }

    this.schemaOptions = { query, mutation, subscription, types, directives };
  }

  schema: GraphQLSchema;

  onBootstrap() {
    this.schema = new GraphQLSchema(this.schemaOptions);
  }
}
