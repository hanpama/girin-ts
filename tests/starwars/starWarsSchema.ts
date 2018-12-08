import { GraphQLEnumType, GraphQLSchema } from 'graphql';

import { getFriends, getHero, getHuman, getDroid, EpisodeValue, CharacterSource, HumanSource, DroidSource } from './starWarsData';

import { getType, defineType, gql } from '../../src';
import { ResolverContext, source } from '../../src/utilities/ResolverContext';


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
  friends: [${Character}]

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
abstract class Character<TSource extends CharacterSource> extends ResolverContext<TSource> {
  @source() id: string;
  @source() name: string;
  @source() appearsIn: EpisodeValue[];

  get secretBackstory(): string {
    throw new Error('secretBackstory is secret.');
  }

  async friends() {
    const friendSources = await Promise.all(getFriends(this.$source));
    if (friendSources) {
      return friendSources.map(Character.$fromSource);
    }
    return null;
  }

  static $fromSource = (source: CharacterSource): Human | Droid | null => {
    if (source.type === 'Human') {
      return new Human(source as HumanSource);
    } else if (source.type === 'Droid') {
      return new Droid(source as DroidSource);
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
class Human extends Character<HumanSource> {
  @source() homePlanet?: string;
}


@defineType(gql`
  """
  A mechanical creature in the Star Wars universe.
  """
  type Droid implements ${Character} {

    """
    The primary function of the droid.
    """
    primaryFunction: String

    # and fields from class Character
  }
`)
class Droid extends Character<DroidSource> {
  @source() primaryFunction: string;
}


@defineType(gql`
  type Query {
    hero(
      """
      If omitted, returns the hero of the whole saga. If provided, returns the hero of that particular episode.
      """
      episode: ${episodeEnum}
    ): ${Character}

    human(
      """
      id of the human
      """
      id: String!
    ): ${Human}

    droid(
      """
      id of the droid
      """
      id: String!
    ): ${Droid}
  }
`)
class Query {
  public static hero(_source: null, { episode }: { episode: number }) {
    return Character.$fromSource(getHero(episode));
  }
  public static human(_source: null, { id }: { id: string }) {
    const source = getHuman(id);
    return source && new Human(source);
  }
  public static droid(_source: null, { id }: { id: string }) {
    const source = getDroid(id);
    return source && new Droid(source);
  }
}

export const StarWarsSchema = new GraphQLSchema({
  query: getType(Query),
  types: [
    getType(Human),
    getType(Droid),
  ]
});
