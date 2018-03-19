# Girin: GraphQL framework

Girin is a GraphQL framework written in TypeScript.

```typescript
@Definition(gql`
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

* Seamless integration between GraphQL SDL and TypeScript classes
* Modularization of GraphQL type definitions

## Installation

```sh
npm install girin graphql
```
