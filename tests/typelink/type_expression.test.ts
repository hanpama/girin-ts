// import { GraphQLNamedType } from 'graphql';

// import { getGlobalMetadataStorage, TypeExpression,  gql, defineType } from '..';


describe('createFromTypeString', () => {
  // const storage = getGlobalMetadataStorage();

  it('is created as expected', () => {
    // const bool = new TypeExpression('Boolean', []);
    // const type: any = bool.getType(storage, 'any');
    // expect(type.name).toBe('Boolean');
  });

  it('resolves explicit output/input type expression', () => {
    // @defineType(gql`
    //   type Person {
    //     name: String!
    //     email: String
    //   }
    //   input PersonInput {
    //     name: String!
    //     email: String
    //   }
    // `)
    // class Person {
    //   name: string;
    //   email?: string;
    // }

    // const personOutput = new TypeExpression(Person, []).getType(storage, 'output') as GraphQLNamedType;
    // const personInput = new TypeExpression(Person, []).getType(storage, 'input') as GraphQLNamedType;
    // expect(personOutput.name).toBe('Person');
    // expect(personInput.name).toBe('PersonInput');
  });

  it('coerces', () => {

  });
});
