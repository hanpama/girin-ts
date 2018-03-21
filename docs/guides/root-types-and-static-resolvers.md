# Root Types and Static Resolvers

When using the `@Definition ()` decorator, if the class has a static function with the same name as the field name, the function will be used as the field resolver.

```typescript
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
```

Note that `@Definition()` decorator does not set the function of the decorated class prototype as a resolver unless the decorated class does not have corresponding static function.
