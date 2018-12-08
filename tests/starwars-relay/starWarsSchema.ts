import { GraphQLSchema } from 'graphql';
import { fromGlobalId, ConnectionArguments, toGlobalId } from 'graphql-relay';

import { defineType, gql, getType, Mutation, Node, RelayMutation, defineConnection } from '../../src';
import { ResolverContext, source } from '../../src/utilities/ResolverContext';

import { createShip, ShipSource, FactionSource, getFaction, getRebels, getEmpire, getShip } from './starWarsData';
import { ArrayConnection } from './ArrayConnection';


@defineType(gql`
  """
  A ship in the Star Wars saga
  """
  type Ship implements Node {
    """
    The id of the object.
    """
    id: ID!
    """
    The name of the ship.
    """
    name: String
  }
`)
class Ship extends ResolverContext<ShipSource> implements Node {
  static getById(id: string) {
    const shipSource = getShip(id);
    return new Ship(shipSource);
  }

  id() {
    return toGlobalId('Ship', this.localId);
  }

  @source('id')
  localId: string;

  @source() name: string;
}

@defineConnection({ node: Ship })
class ShipConnection extends ArrayConnection<Ship, string> {
  resolveNode(edge: { source: string }) {
    return Ship.getById(edge.source);
  }
}

@defineType(gql`
  type Faction implements Node {
    """
    The id of the object.
    """
    id: ID!
    """
    The name of the faction.
    """
    name: String
    """
    The ships used by the faction.
    """
    ships(first: Int, last: Int, before: String, after: String): ${ShipConnection}
  }
`)
class Faction extends ResolverContext<FactionSource> implements Node {
  static getById(id: string) {
    const factionSource = getFaction(id);
    return new Faction(factionSource);
  }

  id() {
    return toGlobalId('Faction', this.localId);
  }

  @source('id') localId: string;

  @source() name: string;
  ships(args: ConnectionArguments) {
    return new ShipConnection(this.$source.ships, args);
  }
}

@defineType(gql`
  type Query {
    rebels: ${Faction}
    empire: ${Faction}
    node(id: ID!): ${Node}
  }
`)
class Query {
  static rebels() {
    return new Faction(getRebels());
  }
  static empire() {
    return new Faction(getEmpire());
  }
  static node(_source: null, args: { id: string }) {
    const { type, id } = fromGlobalId(args.id);

    if (type === 'Ship') {
      return Ship.getById(id);
    }
    if (type === 'Faction') {
      return Faction.getById(id);
    }
    return null;
  }
}

@defineType(gql`
  input IntroduceShipInput {
    shipName: String!
    factionId: ID!
  }
  type IntroduceShipPayload {
    ship: ${Ship}
    faction: ${Faction}
  }
  extend type Mutation {
    introduceShip(input: ${IntroduceShipMutation}): ${IntroduceShipMutation}
  }
`)
class IntroduceShipMutation extends RelayMutation {
  shipName: string;
  factionId: string;
  ship: Ship;

  faction() {
    return new Faction(getFaction(this.factionId));
  }

  static introduceShip(_source: null, args: { input: IntroduceShipMutation }) {
    const container = args.input;
    const newShip = createShip(container.shipName, container.factionId);
    container.ship = new Ship(newShip);
    return container;
  }
}

export const StarWarsSchema = new GraphQLSchema({
  query: getType(Query),
  mutation: getType(Mutation),
  types: [getType(IntroduceShipMutation)],
});
