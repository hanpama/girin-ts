import { defaultFieldResolver, GraphQLBoolean, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import { ObjectType } from '../definition/ObjectType';
import { getGlobalMetadataStorage } from '../global';
import { Field } from '../reference/Field';
import { bindStaticResolver } from '../sdl/ast';
import { coerceType } from '../type-expression/coerceType';
import { List, NonNull } from '../type-expression/structure';
import { TypeExpression } from '../type-expression/TypeExpression';
import { TypeArg } from '../type-expression/types';


type ConnectionByNode = { node: TypeArg | TypeExpression, edge?: undefined };
type ConnectionByEdge = { edge: TypeArg | TypeExpression, node?: undefined };
type DefineConnectionOptions = { typeName?: string } & (ConnectionByNode | ConnectionByEdge);


export function defineConnection(options: DefineConnectionOptions) {
  return function registerConnectionMetadata(definitionClass: Function) {
    const storage = getGlobalMetadataStorage();

    storage.deferRegister(() => {
      const connectionName = options.typeName || definitionClass.name;

      let edge: TypeExpression;
      const node = coerceType(options.node!);
      const nodeTypeName = node.getTypeName({ storage, kind: 'output' });

      if (options.edge) {
        edge = coerceType(options.edge);
      } else {
        const edgeTypeName = `${nodeTypeName}Edge`;
        defineEdge({ typeName: edgeTypeName, node })(null);
        edge = coerceType(edgeTypeName);
      }

      storage.registerMetadata([
        new ObjectType({
          definitionClass,
          definitionName: connectionName,
          description: 'A connection to a list of items.'
        }),
        new Field({
          source: definitionClass,
          target: NonNull.of(coerceType(pageInfoType)),
          fieldName: 'pageInfo',
          description: 'Information to aid in pagination.',
          args: [],
          resolver: bindStaticResolver(definitionClass, 'pageInfo') || defaultFieldResolver,
        }),
        new Field({
          source: definitionClass,
          target: NonNull.of(List.of(NonNull.of(edge))),
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
      const node = coerceType(options.node);
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
          target: NonNull.of(node),
          fieldName: 'node',
          description: 'The item at the end of the edge',
          args: [],
          resolver: definitionClass && bindStaticResolver(definitionClass, 'pageInfo') || defaultFieldResolver,
        }),
        new Field({
          source: definitionClass || edgeName,
          target: NonNull.of(coerceType('String')),
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
