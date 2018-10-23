import { GraphQLObjectType } from 'graphql';

import { defineType, gql } from '..';
import { TypeExpression } from '../metadata';
import { getGlobalMetadataStorage } from '../global';


@defineType(T => gql`
  type GenericContainer {
    item: ${T}
  }
`)
class GenericContainer<T> {
  constructor(public item: T) {}
}

@defineType(gql`
  type Person {
    firstName: String
    lastName: String
  }
`)
class Person {
  constructor(public firstName: string, public lastName: string) {}
}

@defineType(gql`
  type Book {
    title: String
  }
`)
class Book {

}

describe('generics', () => {
  it('should build multiple type instances for each generic context', () => {
    const storage = getGlobalMetadataStorage();
    const bookContainerExp = new TypeExpression(GenericContainer, {
      typeName: 'BookContainer',
      args: [new TypeExpression(Book, null)],
    });
    const bookContainerType = bookContainerExp.getType(storage, 'any') as GraphQLObjectType;
    expect(bookContainerType.name).toBe('BookContainer');

    const personContainerExp = new TypeExpression(GenericContainer, {
      typeName: 'PersonContainer',
      args: [new TypeExpression(Person, null)],
    });
    const personContainerType = personContainerExp.getType(storage, 'any') as GraphQLObjectType;
    expect(personContainerType.name).toBe('PersonContainer');
  });

  it('should throw an error when being built without generic context', () => {

  });
});
