import { GraphQLEnumType, GraphQLSchema } from "graphql";

import { getFriends, getHero, getHuman, getDroid, EpisodeValue, CharacterSource, HumanSource, DroidSource } from "./starWarsData";
import { defineType, gql, getGraphQLType } from '../../src';


const episodeEnum = new GraphQLEnumType({
  name: 'Episode',
  description: 'One of the films in the Star Wars Trilogy',
  values: {
    NEWHOPE: {
      value: 4,
      description: 'Released in 1977.',
    },
    EMPIRE: {
      value: 5,
      description: 'Released in 1980.',
    },
    JEDI: {
      value: 6,
      description: 'Released in 1983.',
    },
  },
});


@defineType(gql`
"""
A character in the Star Wars Trilogy
"""
interface Character {
  """
  The id of the character.
  """
  id: String!

  """
  the name of the character.
  """
  name: String

  """
  The friends of the character, or an empty list if they have none.
  """
  friends: [Character]

  """
  Which movies they appear in.
  """
  appearsIn: [${episodeEnum}]

  """
  All secrets about their past.
  """
  secretBackstory: String
}
`)
abstract class Character {
  id: string;
  name: string;
  friends: any;
  appearsIn: EpisodeValue[];

  get secretBackstory(): string {
    throw new Error('secretBackstory is secret.')
  }

  static fromSource(source: CharacterSource): Human | Droid | null {
    if (source.type === 'Human') {
      return Human.fromSource(source as HumanSource);
    } else if (source.type === 'Droid') {
      return Droid.fromSource(source as DroidSource);
    } else {
      return null;
    }
  }
}


@defineType(gql`
  """
  A humanoid creature in the Star Wars universe.
  """
  type Human implements ${Character} {
    """
    The home planet of the human, or null if unknown.
    """
    homePlanet: String

    # and fields from class Character
  }
`)
class Human extends Character {

  public friendIds: string[];

  get friends() {
    return getFriends(this).map(promise => promise.then(source => (source && Character.fromSource(source))));
  }

  homePlanet?: string;

  static fromSource(source: HumanSource) {
    return source && Object.assign(new Human(), source);
  }
}


@defineType(gql`
  """
  A mechanical creature in the Star Wars universe.
  """
  type Droid implements Character {

    """
    The primary function of the droid.
    """
    primaryFunction: String

    # and fields from class Character
  }
`)
class Droid extends Character {

  public friendIds: string[];

  get friends() {
    return getFriends(this).map(promise => promise.then(source => (source && Character.fromSource(source))));
  }

  primaryFunction: string;

  static fromSource(source: DroidSource) {
    return source && Object.assign(new Droid(), source);
  }
}


@defineType(gql`
  type Query {
    hero(
      """If omitted, returns the hero of the whole saga. If provided, returns the hero of that particular episode."""
      episode: ${episodeEnum}
    ): Character

    human(
      """id of the human"""
      id: String!
    ): Human

    droid(
      """id of the droid"""
      id: String!
    ): Droid
  }
`)
class Query {
  public static hero(source: null, { episode }: { episode: number }) {
    return Character.fromSource(getHero(episode));
  }
  public static human(source: null, { id }: { id: string }) {
    return Human.fromSource(getHuman(id)!);
  }
  public static droid(source: null, { id }: { id: string }) {
    return Droid.fromSource(getDroid(id)!);
  }
}

export const StarWarsSchema = new GraphQLSchema({
  query: getGraphQLType(Query),
  types: [
    getGraphQLType(Human),
    getGraphQLType(Droid),
  ]
});
