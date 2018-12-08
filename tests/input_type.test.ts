import { GraphQLSchema, graphql, printSchema } from 'graphql';

import { getType, gql, defineType } from '../src';


@defineType(gql`
  input NameInput {
    firstName: String!
    lastName: String!
  }
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

let instantiationCount = 0;

@defineType(gql`
  input PersonInput {
    address: String!
    name: ${Name}
  }
  type Person {
    address: String!
    name: ${Name}
  }
`)
class Person {
  address: string;
  name: Name;
  constructor() {
    instantiationCount ++;
  }
}

@defineType(gql`
  type Group {
    echoPerson(person: ${Person}): ${Person}!
  }
`)
class Group {
  echoPerson(args: { person: Person }) {
    return args.person;
  }
}

@defineType(gql`
  type Query {            # resolved to NameInput
    formatFullName(input: ${Name}): String!
                                    # resolved to PersonInput
    personInputInstantiated(person: ${Person}): Boolean!
    personNonNullInputWorks(person: ${Person}!): Boolean!
    personNonNullListInputWorks(people: [${Person}!]): Boolean!

    echoPerson(person: ${Person}): ${Person}! # resolved to Person
    tenGroups: [${Group}]!
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
  static tenGroups() {
    const groups = [];
    for (let i = 0; i < 10; i++) {
      groups.push(new Group());
    }
    return groups;
  }
}

const schema = new GraphQLSchema({
  query: getType(Query),
});

describe('Input type', () => {
  it('generates schema and works as expected', async () => {

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
        address: 'A',
        name: {
          firstName: 'Foo',
          lastName: 'Bar'
        }
      }
    } });
  });

  it('should not instantiate input type which is already cached', async () => {
    instantiationCount = 0;
    await graphql({ schema, source: `
      query($person: PersonInput) {
        tenGroups {
          echoPerson(person: $person) {
            address
          }
        }
      }
    `, variableValues: {
      person: {
        address: 'A',
        name: {
          firstName: 'Foo',
          lastName: 'Bar'
        }
      },
    }}); // giving argument as variable lets us avoid extra instantiations
    expect(instantiationCount).toBe(1);
  });
});
