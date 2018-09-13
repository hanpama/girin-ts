# Girin: GraphQL framework

Girin is a GraphQL framework written in TypeScript.

* Seamless integration between GraphQL SDL and TypeScript classes
* Modularization of GraphQL type definitions

[![npm version](https://badge.fury.io/js/girin.svg)](https://badge.fury.io/js/girin)
[![Build Status](https://travis-ci.org/hanpama/girin.svg?branch=master)](https://travis-ci.org/hanpama/girin)
[![codecov](https://codecov.io/gh/hanpama/girin/branch/master/graph/badge.svg)](https://codecov.io/gh/hanpama/girin)

* Documentation: https://hanpama.github.io/girin

```typescript
@ObjectType.define(gql`
  type Member {
    id: Int!
    name: String!
    email: String!
    friend: Member
  }
`)
class Member {
  id: number;
  name: string;
  email: string;

  private friendId: number;

  friend() {
    return members.find(m => m.id === this.friendId);
  }
}
```

## Installation

```sh
npm install girin graphql
```

## Examples

### Todolist App

Working example of simple todolist

* [Demo](https://todolist.giringraphql.com/)
* [Source Code](https://github.com/hanpama/girin/tree/master/examples/todolist-apollo)


### Starwars Schema

* [Starwars Schema](https://github.com/hanpama/girin/tree/master/packages/girin/test/starwars/starWarsSchema.ts)
* [Starwars Schema Relay](https://github.com/hanpama/girin/tree/master/packages/girin-relay/test/starWarsSchema.ts)
