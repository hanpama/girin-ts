import { GraphQLSchema, subscribe, parse } from "graphql";
import { typedef, gql, getGraphQLType, Query } from "..";


@typedef(gql`
  extend type Subscription {
    inputIsInstantiated(foo: ${Foo}): Boolean
  }
  input Foo {
    field: Int
  }
`)
class Foo {
  static async *inputIsInstantiated(_source: null, args: { foo: Foo }) {
    yield args.foo instanceof this;
  }

  field: number;
}

@typedef(gql`
  type Subscription {
    countUp(from: Int): Int
  }

  extend type Query {
    hello: String
  }
`)
class Subscription {
  static async *countUp(_source: null, args: { from: number }) {
    for(let i = args.from || 0; i < 10; i++) {
      yield i;
    }
  }

  static hello() { return 'subscriptions'; }
}

const schema = new GraphQLSchema({
  query: getGraphQLType(Query),
  subscription: getGraphQLType(Subscription),
  types: [getGraphQLType(Foo)],
});

describe('Subscription', () => {
  it('can be subscribed', async () => {
    const subsFromZero = await subscribe({ schema, document: parse(`
      subscription {
        countUp
      }
    `)}) as AsyncIterator<any>;

    const subsFromFive = await subscribe({ schema, document: parse(`
      subscription {
        countUp(from: 5)
      }
    `)});

    let countFromZero: number[] = [];
    for (const resPromise of subsFromZero as any) {
      const res = await resPromise;
      countFromZero.push(res.data.countUp);
    }
    expect(countFromZero).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

    let countFromFive: number[] = [];
    for (const resPromise of subsFromFive as any) {
      const res = await resPromise;
      countFromFive.push(res.data.countUp);
    }
    expect(countFromFive).toEqual([5, 6, 7, 8, 9]);
  });

  it('instantiates input objects', async () => {
    const subs = await subscribe({ schema, document: parse(`
      subscription {
        inputIsInstantiated(foo: { field: 12 })
      }
    `)}) as AsyncIterator<any>;

    const instantiated = await subs.next();
    expect(instantiated).toBeTruthy();
  })
});
