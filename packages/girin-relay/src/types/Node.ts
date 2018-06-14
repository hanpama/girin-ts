import { GraphQLResolveInfo } from "graphql";
import { fromGlobalId } from "graphql-relay";
import { ObjectType } from "girin/metadata/ObjectType";
import { DefinitionClass, isSubClassOf } from "girin/types";
import { Field, NonNull, IDScalar } from "girin";
import { MetadataStorage } from "girin/base/MetadataStorage";
import { InputField } from "girin/field/InputField";
import { InterfaceType } from "../../../girin/metadata";
import { gql } from "../../../girin/sdl";


@InterfaceType.define(gql`
  interface Node {
    """The id of the object."""
    id: ID!
  }
`)
export class Node {
  id: string;
}

export interface NodeDefinitionClass extends DefinitionClass {
  fetch(id: string): Node;
}

export interface NodeMap { [typeName: string]: NodeDefinitionClass }

export class NodeField extends Field {
  args = [
    { name: 'id', field: new InputField(NonNull.of(IDScalar)), props: {} }
  ]
  constructor() {
    super(Node);
  }

  buildResolver(storage: MetadataStorage) {
    const nodeMap: NodeMap = storage.definitionMetadata
      .filter(entry => isSubClassOf(entry.definitionClass, Node))
      .reduce((map, entry) => {
        map[entry.metadata.typeName] = entry.definitionClass as any;
        return map;
      }, {} as NodeMap);

    return (source: any, args: { id: string }, context: any, info: GraphQLResolveInfo) => {
      const { type, id } = fromGlobalId(args.id);
      return nodeMap[type].fetch(id);
    };
  }
}

export class NodeType extends ObjectType { }
