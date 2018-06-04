import { defineType, gql, getGraphQLType } from "../src";
import { GraphQLSchema, graphql, printSchema } from "graphql";


@defineType(gql`
  input NameInput {
    firstName: String!
    lastName: String!
  }
`)
class NameInput {
  firstName: string;
  lastName: string;
}

@defineType(gql`
  type Query {
    formatFullName(input: ${NameInput}): String!
  }
`)
class Query {
  static formatFullName(source: null, args: { input: NameInput }) {
    return `${args.input.firstName} ${args.input.lastName}`;
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
        formatFullName(input: { firstName: "Kibum", lastName: "Kim" })
      }
    ` });

    expect(results).toEqual({ data: { formatFullName: 'Kibum Kim' } });

  });
});
