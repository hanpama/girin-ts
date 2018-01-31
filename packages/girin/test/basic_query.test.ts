import { graphql, GraphQLSchema, printSchema } from 'graphql';

import { ObjectType } from '../src/decorators/ObjectType';
import { Field } from '../src/decorators/Field';
import { Argument } from '../src/decorators/Argument';
import { getGraphQLType } from '../src/getGraphQLType';


interface TestSource {
  fieldWithDefaultResolver?: string;
}

@ObjectType()
class Test {
  constructor(public source: TestSource) {
    this.fieldWithDefaultResolver = source.fieldWithDefaultResolver;
  }

  @Field('Boolean!', {
    description: 'description1',
  })
  public resolverGotDefinitionInstance() {
    return this instanceof Test;
  }

  @Field('String!')
  public greeting(
    @Argument('name: String!') name: string,
    @Argument('greeting: String') greeting: string,
  ) {
    return `${greeting || 'Hello'}, ${name}`;
  }

  @Field('String!')
  public bigGreeting(
    @Argument("name: String!") name: string,
    @Argument("greeting: String") greeting: string,
  ) {
    return this.greeting(name, greeting) + '!';
  }

  @Field('String') fieldWithDefaultResolver?: string;
}

@ObjectType()
class Query {
  @Field('Test')
  public test() {
    return new Test({});
  }

  @Field('Test')
  public erroneousTest() {
    return {};
  }

  @Field('Test')
  public testPassingSource() {
    return new Test({ fieldWithDefaultResolver: 'Ohayo' });
  }
}

const schema = new GraphQLSchema({
  query: getGraphQLType(Query),
});

describe('Basic queries and schema generation', async () => {

  it('generates schema as expected', () => {
    expect(printSchema(schema)).toMatchSnapshot();
  });

  it('passes source and args to its resolver', async () => {
    const result = await graphql({ schema, source: `
      query {
        test {
          resolverGotDefinitionInstance
          greeting(name: "Suzuki")
          bigGreeting(name: "Suzuki")
          fieldWithDefaultResolver
        }
        testPassingSource {
          fieldWithDefaultResolver
        }
      }
    `});
    expect(result.data!.test.resolverGotDefinitionInstance).toBe(true);
    expect(result.data!.test.greeting).toBe('Hello, Suzuki');
    expect(result.data!.test.bigGreeting).toBe('Hello, Suzuki!');
    expect(result.data!.test.fieldWithDefaultResolver).toBe(null);
    expect(result.data!.testPassingSource.fieldWithDefaultResolver).toBe('Ohayo');
  });

  it('checks its source is an instance of definition class', async () => {
    const result = await graphql({ schema, source: `
      query {
        erroneousTest {
          resolverGotDefinitionInstance
          greeting(name: "Suzuki")
        }
      }
    `});
    expect(result.errors![0].message).toBe(
      `Expected value of type \"Test\" but got: [object Object].`
     );
  });
});
