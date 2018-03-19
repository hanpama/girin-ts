import { Definition, gql } from "girin"
import { GraphQLResolveInfo } from "graphql";
import { toGlobalId } from "graphql-relay";


@Definition(gql`
  interface Node {
    """The id of the object."""
    id: ID!
  }
`)
export abstract class Node {
  static instantiate<T extends { id: string, [propertyName: string]: any }>(this: typeof Node & { new(): any }, source: T) {
    return Object.keys(source).reduce(function (node, propertyName) {
      if (propertyName == 'id') {
        node.sourceId = source.id;
      } else {
        node[propertyName] = source[propertyName];
      }
      return node;
    }, new this());
  }

  protected sourceId: string;
  id(args: any, context: any, info: GraphQLResolveInfo) {
    return toGlobalId(info.parentType.name, this.sourceId);
  }
}
