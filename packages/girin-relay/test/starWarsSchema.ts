import { fromGlobalId, connectionFromArray, ConnectionArguments } from "graphql-relay";
import { GraphQLSchema } from "graphql";

import { getRebels, getEmpire, getFaction, getShip, createShip } from "./starWarsData";
import { Definition, gql, getGraphQLType } from "girin";

import { Node, Connection, Edge } from "../src";


@Definition(gql`
  """
  A ship in the Star Wars saga
  """
  type Ship implements Node {
    """The name of the ship"""
    name: String

    # ... and fields from class Node
  }
`)
export class Ship extends Node {
  name: string;
}

@Definition(gql`
  type ShipEdge {
    node: Ship
  }
`)
class ShipEdge extends Edge<Ship> {
  node: Ship;
}

@Definition(gql`
  type ShipConnection {
    edges: [${ShipEdge}]
  }
`)
class ShipConnection extends Connection<ShipEdge> {
  edges: ShipEdge[];
}

@Definition(gql`
  """
  A faction in the Star Wars saga
  """
  type Faction implements Node {
    """The name of the faction"""
    name: String

    """The ships used by the faction."""
    ships(after: String, first: Int, before: String, last: Int): ${ShipConnection}

    # ... and fields from class Node
  }
`)
export class Faction extends Node {

  name: string;

  shipIds: string[];
  ships(args: ConnectionArguments): any {
    return connectionFromArray(this.shipIds.map(getShip), args);
  }
}

@Definition(gql`
  type Query {
    rebels: ${Faction}
    empire: ${Faction}
    node(id: ID!): ${Node}
  }
`)
class Query {
  static rebels() {
    return getRebels();
  }

  static empire() {
    return getEmpire();
  }

  static node(source: null, { id: globalId }: { id: string }) {
    const { type, id } = fromGlobalId(globalId);
    if (type === 'Faction') {
      return Faction.instantiate(getFaction(id));
    }
    if (type === 'Ship') {
      return Ship.instantiate(getShip(id));
    }
    return;
  }
}


@Definition(gql`
  input IntroduceShipInput {
    clientMutationId: String
    shipName: String!
    factionId: ID!
  }
`)
class IntroduceShipInput {
  clientMutationId?: string;
  shipName: string;
  factionId: string;
}

@Definition(gql`
  type IntroduceShipPayload {
    clientMutationId: String
    ship: ${Ship}!
    faction: ${Faction}
  }
`)
class IntroduceShipPayload {
  public clientMutationId?: string;

  public ship() {
    return getShip(this.shipId);
  }
  public faction() {
    return getFaction(this.factionId);
  }

  shipId: string;
  factionId: string;
}


@Definition(gql`
  type Mutation {
    introduceShip(input: ${IntroduceShipInput}): ${IntroduceShipPayload}
  }
`)
class Mutation {
  static introduceShip(source: null, { input }: { input: IntroduceShipInput }) {
    const newShip = createShip(input.shipName, input.factionId);
    return {
      clientMutationId: input.clientMutationId,
      shipId: newShip.id,
      factionId: input.factionId,
    };
  }
}

export const StarWarsSchema = new GraphQLSchema({
  query: getGraphQLType(Query),
  mutation: getGraphQLType(Mutation),
  types: [getGraphQLType(Ship)]
});
