# Girin: GraphQL framework

Girin is a GraphQL framework written in TypeScript.

it helps you write maintainable GraphQL schema with static types.

## Features

* TypeScript(ES6) decorator based DSL for creating GraphQL schema

## Installation

```sh
npm install girin graphql
```

## ObjectType and Fields

```typescript
import { Field, ObjectType } from 'girin';

@ObjectType()
class Member {

  @Field('Int!')
  public id: number;

  @Field('String!')
  public name: string;

  @Field('String!')
  public email: string;
}
```

You can define GraphQL ObjectTypes with TypeScript(ES6) classes.
By decorating its property, you can easily transform class fields into GraphQL fields.

```typescript
import { GraphQLObjectType } from 'graphql';
import { getGraphQLType } from 'girin';

const MemberObjectType: GraphQLObjectType = getGraphQLType(Member);
```

```graphql
type Member {
  id: Int!
  username: String!
  email: String!
}
```

## `getGraphQLType` function

`getGraphQLType` function build a decorated class to plain `GraphQLType` instance, so you can
use this in place where you want to get `GraphQLType` object like:

```typescript
import { GraphQLSchema } from 'graphql';
import { ObjectType, Field, getGraphQLType } from 'girin';

@ObjectType()
class Query {
  @Field('String!') greeting() {
    return 'Hi!';
  }
}

const schema = new GraphQLSchema({
  query: getGraphQLType(Query)
});
```


## Resolvers and Field Arguments

```typescript
@ObjectType()
class Greeting {

  @Field('String!')
  public greeting(
    @Argument("name: String!") name: string,
    @Argument("greeting: String") greeting: string,
  ) {
    return `${greeting || 'Hello'}, ${name}`;
  }

  @Field('String!')
  public bigGreeting(
    @Argument("name: String!") name: string,
    @Argument("greeting: String") greeting: string,
    context,
    info,
  ) {
    return this.greeting(name, greeting) + '!!';
  }
}

```

If the decorator is attached to a method, it creates a field with the decorated function as its resolver.
You can decorate the function's arguments to make them graphql arguments.

As you can see in `bigGreeting()` method body,
you can access `Greeting` object and its other fields and methods at execution time.


```
type Greeting {
  greeting(greeting: String, name: String!): String!
  bigGreeting(greeting: String, name: String!): String!
}
```

## InputObjectType

```ts
@InputObjectType()
class MemberInput {
  constructor(
    @InputField("username: String!")
    public username: string,
    @InputField("email: String!")
    public email: string,
  ) {
    super();
  }

  hasValidEmail() {
    return email.includes("@");
  }
}

@ObjectType()
class Mutation {
  @Field('Member!')
  public createMember(
    @Argument("member: MemberInput!") member: MemberInput,
  ) {
    if (!member.hasValidEmail()) {
      throw new Error('Invalid Email');
    }
    return new Member(member);
  }
}
```

`InputObjectType`s are exact opposite of `ObjectType`.

You can decorate its constructor arguments to make them GraphQL input fields.
Classes decorated with `@InputObjectType()` will be instantiated when resolver executed.
