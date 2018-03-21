# Lists and Non-Null

> Object types, scalars, and enums are the only kinds of types you can define in GraphQL. But when you use the types in other parts of the schema, or in your query variable declarations, you can apply additional type modifiers that affect validation of those values. http://graphql.org/learn/schema/#lists-and-non-null

Lists and Non-Null are well supported in SDL, so you can use them like this:

```typescript
import { Definition, gql } from 'girin';

@Definition(gql`
  type Member {
    id: Int!
    name: String!
    friends: [${Member}] # <-- List of Member
    archEnemy: Member! # <-- All member must have archEnemy
  }
`)
class Member {
  id: number;
  name: string;
  friends: Member[]; // <-- Array of Member
  archEnemy: Member; // <-- Member
}
```
