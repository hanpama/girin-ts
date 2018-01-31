import { GraphQLInterfaceType } from "graphql";

import { InterfaceType } from "../src/decorators/InterfaceType";
import { Field } from "../src/decorators/Field";
import { getGraphQLType } from "../src/index";


test('InterfaceType', () => {

  @InterfaceType()
  class Person {
    @Field('String!') name: string;
  }

  const type: GraphQLInterfaceType = getGraphQLType(Person);

  expect(type.name).toEqual('Person');
  expect(Object.keys(type.getFields())).toEqual(['name']);
  expect(type.getFields().name.type.toString()).toEqual('String!');
});
