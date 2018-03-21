# Interfaces

> An Interface is an abstract type that includes a certain set of fields that a type must include to implement the interface. http://graphql.org/learn/schema/#interfaces

## Basic

You can define an interface types decorating an abstract class (or a class) with `@Definition()` decorator. (`interface` in TypeScript doesn't work here because it cannot be referenced as a value at runtime.)


```typescript
import { Definition, gql } from 'girin';

@Definition(gql`
  """A character in the Star Wars Trilogy"""
  interface Character {
    id: String!
    name: String
  }
`)
abstract class Character { // or class Character
  id: string
  name: string?
}
```

## Implementation

When you create a type in SDL, the type can implement the interface like this:

```typescript
@Definition(gql`
  """
  A humanoid creature in the Star Wars universe.
  """
  type Human implements ${Character} { # <-- class Character
    id: String!
    name: String
    homePlanet: String
  }
`)
class Human {
  id: string
  name: string?
  homePlanet: string?
}
```

## Inheritance

If you want to avoid duplication of field definitions, you can inherit fields from the actual class decorated. In this case, the fields of the superclass can be used without re-specifying the fields in SDL.

```typescript
@Definition(gql`
  """
  A humanoid creature in the Star Wars universe.
  """
  type Human implements ${Character} {
    # ... Fields from class Character
    homePlanet: String
  }
`)
class Human extends Character { // <-- Human < Character
  homePlanet: string?
}
```

Even if you inherit from a class, redefining fields in SDL is also possible.

Note that these inheritance is supported by all classes defined with the `@Definition()` decorator. More information on this can be found in `Inheritance`.


## Resolving Type

Interface types are abstract types, so when resolving them you need to know the exact type of the source. There are two ways to do this.

### Field resolver returns an explicit object

The resolver of the field returning the interface can resolve and return what type the source is.

```typescript
@Definition(gql`
  type Query {
    node(id: ID!): ${Node}
  }
`)
class Query {
  static node(source: null, { id: globalId }: { id: string }) {
    const { type, id } = fromGlobalId(globalId);
    if (type === 'Faction') {
      return Object.assign(new Faction(), getFaction(id));
    }
    if (type === 'Ship') {
      return Object.assign(new Ship(), getShip(id));
    }
    return;
  }
}
```

Above, it is similar with Girin's default instantiator. It does not matter if you return only the objects of the concrete type to return.

### Make Interface knows how to resolve type from source

```typescript
@Definition(gql`
"""
A character in the Star Wars Trilogy
"""
interface Character {
  """The id of the character."""
  id: String!

  """the name of the character."""
  name: String
}
`)
abstract class Character {
  id: string;
  name: string;

  static instantiate(source: CharacterSource) {
    return source.type === 'Human'
      ? Object.assign(new Human(), source)
      : Object.assign(new Droid(), source)
  }
}
```

The `static instantiate()` function defined here is an instantiation function that the decorated class can optionally have. If not defined, default `instantiate` function just creates a new object which prototype is target class' prototype and assign the resolved value to the object.

In the case of interfaces, the default instantiate action is not valid because they must be resolved to concrete types.

For more information, see the `Instantiate` section of this document.
