import { printSchema } from "graphql/utilities/schemaPrinter";
import { GraphQLSchema } from "graphql/type/schema";
import { graphql } from "graphql/graphql";

import { Field } from "../src/decorators/Field";
import { Implements } from "../src/decorators/Implements";
import { Argument } from "../src/decorators/Argument";
import { ObjectType } from "../src/decorators/ObjectType";
import { getGraphQLType } from "../src/getGraphQLType";
import { InterfaceType } from "../src/decorators/InterfaceType";


@InterfaceType()
class Person {
  @Field('String!') name: string;
  @Field('Int!') id: number;
}

const data: any = {
  celebrity: [
    { id: 0, name: 'Key', email: 'k@example.com' },
    { id: 1, name: 'Jonghyun', email: 'j@example.com' },
  ],
  fan: [
    { id: 0, name: 'Foo', email: 'foo@example.com', celebrityId: 0 },
    { id: 1, name: 'Bar', email: 'bar@example.com', celebrityId: 1 },
  ],
};

interface CelebritySource {
  id: number;
  name: string;
  email: string;
}

@ObjectType()
@Implements(Person)
class Celebrity extends Person {
  constructor(source: CelebritySource) {
    super();
    this.id = source.id;
    this.name = source.name;
    this.email = source.email;
  }



  @Field('String!') email: string;

  @Field('String!') name: string;
}

interface FanSource {
  id: number;
  name: string;
  email: string;
  celebrityId: number;
}

@ObjectType()
@Implements(Person)
class Fan extends Person {
  constructor(private source: FanSource) {
    super();
    this.id = source.id;
    this.email = source.email;
    this.name = source.name;
  }
  @Field('Int!') id: number;

  @Field('String!') email: string;

  @Field('String!') name: string;

  @Field('Celebrity')
  fanOf() {
    return new Celebrity(data.celebrity[this.source.celebrityId]);
  }
}

@ObjectType()
class Query {
  @Field('Person')
  person(
    @Argument('type: String!') type: string,
    @Argument('id: Int!') id: number,
  ) {
    const source = data[type].find((item: any) => item.id === id);
    if (type === 'celebrity') {
      return new Celebrity(source);
    } else if (type === 'fan') {
      return new Fan(source);
    }
    return null;
  }
}

const schema = new GraphQLSchema({
  query: getGraphQLType(Query),
  types: [
    getGraphQLType(Celebrity),
    getGraphQLType(Fan),
  ],
});


describe('interfaces', () => {
  it('generates schema as expected', () => {
    expect(printSchema(schema)).toMatchSnapshot();
  });

  it('resolves type', async () => {
    const result = await graphql({ schema, source: `
      query {
        celebrityQuery: person(type: "celebrity", id: 1) {
          id
          name
        }
        fanQuery: person(type: "fan", id: 0) {
          id
          name
          ...on Fan {
            fanOf {
              id
              name
            }
          }
        }
      }
    `});
    // console.log(JSON.stringify(result, null, '  '));

    expect(result.data!.celebrityQuery.id).toBe(1);
    expect(result.data!.celebrityQuery.name).toBe("Jonghyun");
    expect(result.data!.fanQuery.id).toBe(0);
    expect(result.data!.fanQuery.name).toBe("Foo");
    expect(result.data!.fanQuery.fanOf.id).toBe(0);
    expect(result.data!.fanQuery.fanOf.name).toBe("Key");
  });
});
