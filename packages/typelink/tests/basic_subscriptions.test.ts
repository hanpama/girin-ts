import { GraphQLSchema, subscribe, parse } from 'graphql';
import { defineType, gql, getType, Query } from '../src';

import { createAsyncIterator } from 'iterall';


@defineType(gql`
  extend type Subscription {
    inputIsInstantiated(foo: ${Foo}): Boolean
  }
  input Foo {
    field: Int
  }
`)
class Foo {
  static inputIsInstantiated(_source: null, args: { foo: Foo }) {
    return createAsyncIterator([args.foo instanceof this]);
  }

  field: number;
}

@defineType(gql`
  type Subscription {
    countUp(from: Int): Int
  }

  extend type Query {
    hello: String
  }
`)
class Subscription {
  static countUp(_source: null, args: { from: number }) {
    const numbers = [];
    for (let i = args.from || 0; i < 3; i++) {
      numbers.push(i);
    }
    return createAsyncIterator(numbers);
  }

  static hello() { return 'subscriptions'; }
}

const schema = new GraphQLSchema({
  query: getType(Query),
  subscription: getType(Subscription),
  types: [getType(Foo)],
});

describe('Subscription', () => {
  it('can be subscribed', async () => {
    const subsFromZero = await subscribe({ schema, document: parse(`
      subscription {
        countUp
      }
    `)}) as AsyncIterator<any>;

    const subsFromOne = await subscribe({ schema, document: parse(`
      subscription {
        countUp(from: 1)
      }
    `)}) as AsyncIterator<any>;

    expect(await subsFromZero.next()).toEqual({
      done: false, value: { data: { countUp: 0 } },
    });
    expect(await subsFromZero.next()).toEqual({
      done: false, value: { data: { countUp: 1 } },
    });
    expect(await subsFromZero.next()).toEqual({
      done: false, value: { data: { countUp: 2 } },
    });
    expect(await subsFromZero.next()).toEqual({
      done: true,
    });

    expect(await subsFromOne.next()).toEqual({
      done: false, value: { data: { countUp: 1 } },
    });
    expect(await subsFromOne.next()).toEqual({
      done: false, value: { data: { countUp: 2 } },
    });
    expect(await subsFromOne.next()).toEqual({
      done: true,
    });
  });

  it('instantiates input objects', async () => {
    const subs = await subscribe({ schema, document: parse(`
      subscription {
        inputIsInstantiated(foo: { field: 12 })
      }
    `)}) as AsyncIterator<any>;

    expect(await subs.next()).toEqual({
      done: false, value: { data: { inputIsInstantiated: true } },
    });
    expect(await subs.next()).toEqual({
      done: true,
    });
  });
});
