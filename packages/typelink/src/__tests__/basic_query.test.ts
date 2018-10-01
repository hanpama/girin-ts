import { graphql, GraphQLSchema, printSchema } from 'graphql';

import { getGraphQLType, gql, typedef } from '..';

import { ResolverContext, source } from '../utilities/ResolverContext';


interface TestSource {
  fieldWithDefaultResolver?: string;
}

@typedef(gql`
  type Test {
    """description1"""
    resolverGotDefinitionInstance: Boolean!

    greeting(greeting: String, name: String!): String!
    bigGreeting(greeting: String, name: String!): String!
    fieldWithDefaultResolver: String
  }
`)
class Test extends ResolverContext<TestSource> {
  public resolverGotDefinitionInstance() {
    return this instanceof Test;
  }
  public greeting({ name, greeting }: { name: string, greeting: string }) {
    return `${greeting || 'Hello'}, ${name}`;
  }
  public bigGreeting(arg: { name: string, greeting: string }) {
    return this.greeting(arg) + '!';
  }

  @source() fieldWithDefaultResolver?: string;
}

@typedef(gql`
  type Query {
    test: ${Test}
    erroneousTest: ${Test}
    testPassingSource: ${Test}
  }
`)
class Query extends ResolverContext {
  public static test() {
    return new Test({});
  }
  public static testPassingSource() {
    return new Test({ fieldWithDefaultResolver: 'Ohayo' });
  }
}

const schema = new GraphQLSchema({ query: getGraphQLType(Query) });


describe('Basic queries and schema generation', async () => {

  it('generates schema as expected', () => {
    expect(printSchema(schema)).toMatchSnapshot();
  });

  it('passes source and args to its resolver', async () => {
    let result = await graphql({ schema, source: `
      query {
        test {
          greeting(name: "Suzuki")
          bigGreeting(name: "Suzuki")
          fieldWithDefaultResolver
        }
        testPassingSource {
          fieldWithDefaultResolver
        }
      }
    `});
    expect(result).toEqual({ data: {
      test: {
        greeting: 'Hello, Suzuki',
        bigGreeting: 'Hello, Suzuki!',
        fieldWithDefaultResolver: null,
      },
      testPassingSource: {
        fieldWithDefaultResolver: 'Ohayo',
      },
    } });

    result = await graphql({ schema, source: `
      query {
        test {
          resolverGotDefinitionInstance
        }
      }
    `});
    expect(result).toEqual({ data : {
      test: {
        resolverGotDefinitionInstance: true
      }
    }});
  });
});