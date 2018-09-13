import { GraphQLSchema, graphql, printSchema } from "graphql";

import { gql, getGraphQLType, ObjectType, InputType } from "../src";


@InputType.define(gql`
  input NameInput {
    firstName: String!
    lastName: String!
  }
`)
@ObjectType.define(gql`
  type Name {
    firstName: String!
    lastName: String!
  }
`)
class Name {
  firstName: string;
  lastName: string;

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}

@InputType.define(gql`
  input PersonInput {
    address: String!
    name: ${Name}
  }
`)
@ObjectType.define(gql`
  type Person {
    address: String!
    name: ${Name}
  }
`)
class Person {
  address: string;
  name: Name;
}


@ObjectType.define(gql`
  type Query {            # resolved to NameInput
    formatFullName(input: ${Name}): String!
                                    # resolved to PersonInput
    personInputInstantiated(person: ${Person}): Boolean!
    personNonNullInputWorks(person: ${Person}!): Boolean!
    personNonNullListInputWorks(people: [${Person}!]): Boolean!


    echoPerson(person: ${Person}): Person! # resolved to Person
  }
`)
class Query {
  static formatFullName(_source: null, args: { input: Name }) {
    return args.input.fullName;
  }
  static personInputInstantiated(_source: null, args: { person: Person }) {
    return (args.person instanceof Person) && (args.person.name instanceof Name);
  }
  static personNonNullInputWorks(_source: null, args: { person: Person }) {
    return (args.person instanceof Person) && (args.person.name instanceof Name);
  }
  static personNonNullListInputWorks(_source: null, args: { people: Person[] }) {
    return args.people.reduce((res, person) => {
      return res && (person instanceof Person) && (person.name instanceof Name);
    }, true);
  }
  static echoPerson(_source: null, args: { person: Person }) {
    return args.person;
  }
}

describe('Input type', () => {
  it('generates schema as expected', async () => {
    const schema = new GraphQLSchema({
      query: getGraphQLType(Query),
    });

    expect(printSchema(schema)).toMatchSnapshot();

    const results = await graphql({ schema, source: `
      query {
        formatFullName(input: { firstName: "Foo", lastName: "Bar" })
        personInputInstantiated(person: {
          address: "A",
          name: {
            firstName: "Foo",
            lastName: "Bar"
          }
        })
        personNonNullInputWorks(person: {
          address: "A",
          name: {
            firstName: "Foo",
            lastName: "Bar"
          }
        })
        personNonNullListInputWorks(people: [
          {
            address: "A",
            name: {
              firstName: "Foo",
              lastName: "Bar"
            }
          },
          {
            address: "B",
            name: {
              firstName: "Foo",
              lastName: "Bar"
            }
          }
        ])

        echoPerson(person: {
          address: "A",
          name: {
            firstName: "Foo",
            lastName: "Bar"
          }
        }) {
          address
          name {
            firstName
            lastName
          }
        }
      }
    ` });

    expect(results).toEqual({ data: {
      formatFullName: 'Foo Bar',
      personInputInstantiated: true,
      personNonNullInputWorks: true,
      personNonNullListInputWorks: true,
      echoPerson: {
        address: "A",
        name: {
          firstName: "Foo",
          lastName: "Bar"
        }
      }
    } });
  });
});
