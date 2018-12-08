import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  graphql,
  printSchema,
  GraphQLEnumType
} from 'graphql';

import { getType, gql, defineType } from '../src';


@defineType(gql`
  type ItemInfo {
    description: String
  }
`)
class ItemInfo {
  description() {
    return 'foobarbaz';
  }
}

const itemType = new GraphQLObjectType({
  name: 'Item',
  fields() {
    return {
      name: {
        type: GraphQLString,
        resolve() {
          return 'foo';
        }
      },
      info: {
        type: getType(ItemInfo),
        resolve() { return new ItemInfo(); }
      }
    };
  },
});

const bazEnum = new GraphQLEnumType({
  name: 'Baz',
  values: { A: {}, B: {}, C: {}, }
});

@defineType(gql`
  type Query {
    item: ${itemType}
    nonNullItem: ${itemType}!
    baz: ${bazEnum}
    erroneousBaz: ${bazEnum}
  }
`)
class Query {
  static item() { return {}; }
  static nonNullItem() { return {}; }
  static baz(): 'A' | 'B' | 'C' {
    return 'A';
  }
  static erroneousBaz(): 'A' | 'B' | 'C' {
    return 'D' as any;
  }
}

const schema = new GraphQLSchema({
  query: getType(Query)
});

describe('field with GraphQLType', () => {
  test('generates schema as expected', () => {
    expect(printSchema(schema)).toMatchSnapshot();
  });

  test('query', async () => {
    const result = await graphql({ schema, source: `
      query {
        item {
          name
          info { description }
        }
        nonNullItem {
          name
          info { description }
        }
      }
    `});
    expect(result.data!.item.name).toEqual('foo');
    expect(result.data!.item.info.description).toEqual('foobarbaz');
    expect(result.data!.nonNullItem.name).toEqual('foo');
    expect(result.data!.nonNullItem.info.description).toEqual('foobarbaz');
  });

  test('query enum', async () => {
    let result: any;

    result = await graphql({ schema, source: `
      query {
        baz
      }
    `});
    expect(result.data!.baz).toEqual('A');

    result = await graphql({ schema, source: `
      query {
        erroneousBaz
      }
    `});
    expect(result.errors[0].message).toEqual('Expected a value of type "Baz" but received: "D"');
  });
});
