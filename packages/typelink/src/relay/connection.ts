import { GraphQLObjectType, GraphQLBoolean, GraphQLString, GraphQLNonNull, defaultFieldResolver } from 'graphql';

import {
  TypeArg, TypeExpression, type, List,
  getGlobalMetadataStorage,
  Field, ObjectType
} from '..';
import { bindStaticResolver } from '../sdl/ast';


type ConnectionByNode = { node: TypeArg | TypeExpression, edge?: undefined };
type ConnectionByEdge = { edge: TypeArg | TypeExpression, node?: undefined };
type DefineConnectionOptions = { typeName?: string } & (ConnectionByNode | ConnectionByEdge);


export function defineConnection(options: DefineConnectionOptions) {
  return function registerConnectionMetadata(definitionClass: Function) {
    const storage = getGlobalMetadataStorage();

    storage.deferRegister(() => {
      const connectionName = options.typeName || definitionClass.name;

      let edge: TypeExpression;
      const node = type(options.node!);
      const nodeTypeName = node.getTypeName({ storage, kind: 'output' });

      if (options.edge) {
        edge = type(options.edge);
      } else {
        const edgeTypeName = `${nodeTypeName}Edge`;
        defineEdge({ typeName: edgeTypeName, node })(null);
        edge = type(edgeTypeName);
      }

      storage.registerMetadata([
        new ObjectType({
          definitionClass,
          definitionName: connectionName,
          description: 'A connection to a list of items.'
        }),
        new Field({
          source: definitionClass,
          target: type(pageInfoType),
          fieldName: 'pageInfo',
          description: 'Information to aid in pagination.',
          args: [],
          resolver: bindStaticResolver(definitionClass, 'pageInfo') || defaultFieldResolver,
        }),
        new Field({
          source: definitionClass,
          target: List.of(edge),
          fieldName: 'edges',
          description: 'A list of edges.',
          args: [],
          resolver: bindStaticResolver(definitionClass, 'edges') || defaultFieldResolver,
        }),
      ]);
    });
  };
}

type DefineEdgeOptions = { typeName?: string, node: TypeArg | TypeExpression };

export function defineEdge(options: DefineEdgeOptions) {
  return function registerEdgeMetadata(definitionClass: Function | null) {
    const storage = getGlobalMetadataStorage();
    storage.deferRegister(() => {
      const node = type(options.node);
      const nodeTypeName = node.getTypeName({ storage, kind: 'output' });

      const edgeName = options.typeName
        || (definitionClass && definitionClass.name)
        || `${nodeTypeName}Edge`;

      storage.registerMetadata([
        new ObjectType({
          definitionClass,
          definitionName: edgeName,
          description: 'An edge in a connection.',
        }),
        new Field({
          source: definitionClass || edgeName,
          target: node,
          fieldName: 'node',
          description: 'The item at the end of the edge',
          args: [],
          resolver: definitionClass && bindStaticResolver(definitionClass, 'pageInfo') || defaultFieldResolver,
        }),
        new Field({
          source: definitionClass || edgeName,
          target: type('String'),
          fieldName: 'cursor',
          description: 'A cursor for use in pagination',
          args: [],
          resolver: definitionClass && bindStaticResolver(definitionClass, 'cursor') || defaultFieldResolver,
        }),
      ]);
    });
  };
}

const pageInfoType = new GraphQLObjectType({
  name: 'PageInfo',
  description: 'Information about pagination in a connection.',
  fields: () => ({
    hasNextPage: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'When paginating forwards, are there more items?'
    },
    hasPreviousPage: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'When paginating backwards, are there more items?'
    },
    startCursor: {
      type: GraphQLString,
      description: 'When paginating backwards, the cursor to continue.'
    },
    endCursor: {
      type: GraphQLString,
      description: 'When paginating forwards, the cursor to continue.'
    },
  })
});
