import { GraphQLString, GraphQLBoolean, GraphQLFloat, GraphQLInt, GraphQLID } from 'graphql';
import { MetadataStorage } from '../metadata/MetadataStorage';
import { GraphQLTypeIndex } from './GraphQLTypeIndex';

/**
 * Load all the built in scalar types into a given [[MetadataStorage]].
 * @param storage
 */
export function loadBuiltInScalar(storage: MetadataStorage) {
  storage.registerMetadata([
    new GraphQLTypeIndex({
      definitionClass: null,
      typeInstance: GraphQLString,
    }),
    new GraphQLTypeIndex({
      definitionClass: null,
      typeInstance: GraphQLBoolean,
    }),
    new GraphQLTypeIndex({
      definitionClass: null,
      typeInstance: GraphQLFloat,
    }),
    new GraphQLTypeIndex({
      definitionClass: null,
      typeInstance: GraphQLInt,
    }),
    new GraphQLTypeIndex({
      definitionClass: null,
      typeInstance: GraphQLID,
    }),
  ]);
}
