# Object Types and Fields

> The most basic components of a GraphQL schema are object types, which just represent a kind of object you can fetch from your service, and what fields it has.
http://graphql.org/learn/schema/#object-types-and-fields

```typescript
import { Definition, gql } from 'girin';

@Definition(gql`
  type Member {
    id: Int!
    name: String!
    friend: Member
  }
`)
class Member {
  id: number;
  name: string;
  friend: Member;
}
```

The `@Definition()` decorator is used with the `gql` tag to associate its
decorated class with a GraphQL type definition.

## Field Definition

The type that the field will return, as above, can be specified by its name. In order to benefit from refactoring and so on, we can also directly insert the class into SDL.

```typescript
import { Definition, gql } from 'girin';

@Definition(gql`
  type Member {
    id: Int!
    name: String!
    friend: ${Member} # <-- Member class reference
  }
`)
class Member {
  id: number;
  name: string;
  friend: Member;
}
```

Alternatively, if you are changing existing graphql-js schema incrementally or if it is advantageous to use the graphql-js object, you can also put the instance directly.


```typescript
import { Definition, gql } from 'girin';
import { GraphQLEnumType } from 'graphql';

const planEnum = new GraphQLEnumType({
  name: 'Plan',
  values: {
    FREE: { value: 1 },
    PREMIUM: { value: 2 },
    ON_DEMAND: { value: 9 },
  },
});

@Definition(gql`
  type Member {
    id: Int!
    name: String!
    friend: ${Member}
    plan: ${planEnum} # <-- GraphQLEnumType
  }
`)
class Member {
  id: number;
  name: string;
  friend: Member;
  plan: 1 | 2 | 9; // <-- its possible values
}
```

## Writing Resolvers

If the field resolves just a property, you do not need to specify the resolver. The default resolver will read and return the value.

If a resolver accepts arguments or computes a value with other values in the source, it should be written as a function.

```typescript
@Definition(gql`
  type Message {
    greeting(greeting: String, name: String!): String!
  }
`)
class Message {
  public greeting({ name, greeting }: { name: string, greeting: string }) {
    return `${greeting || 'Hello'}, ${name}`;
  }
}
```

One of the advantages of declaring types in this way is that `this` context is provided. Therefore, you can call another resolver as shown below.

```typescript
@Definition(gql`
  type Message {
    greeting(greeting: String, name: String!): String!
    bigGreeting(greeting: String, name: String!): String!
  }
`)
class Message {
  public greeting({ name, greeting }: { name: string, greeting: string }) {
    return `${greeting || 'Hello'}, ${name}`;
  }
  public bigGreeting(arg: { name: string, greeting: string }) {
    return this.greeting(arg) + '!';
  }
}
```

## Resolving Object Types

One thing to keep in mind when resolve object types is `instantiation`.

The field resolvers defined with Girin's `@Definition()` decorator works as follows to connect the prototype and source of the class when the resolved source is not an instance of the target class.

```typescript
if (!resolvedValue || resolvedValue instanceof definitionClass) {
  return resolvedValue;
}
else {
  return Object.assign(
    Object.create(definitionClass.prototype),
    resolvedValue,
  );
}
```

This allows you to use `this` context with some flexibility when writing resolvers.

You can either rely on these implicit instantiation when writing resolvers, or you can explicitly return an object of that class.

```typescript
import { Definition, gql } from 'girin';

@Definition(gql`
  type Member {
    id: Int!
    name: String!
    friend: ${Member} # <-- Member class reference
  }
`)
class Member {
  id: number;
  name: string;
  friend() {
    return { id: 2, name: 'Foo', friend: null };
    // or return new Member(...);
  }
}
```

In the above example, the value returned by the `friend()` function is treated as follows.

```typescript
if (!resolvedValue || resolvedValue instanceof Member) {
  return resolvedValue;
}
else {
  return Object.assign(
    Object.create(Member.prototype),
    resolvedValue,
  );
}
```

For more information, see the `Instantiate` section of this document.
