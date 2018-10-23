import { GraphQLObjectType } from 'graphql';

import { defineType, gql } from '..';
import { TypeExpression } from '../metadata';
import { getGlobalMetadataStorage } from '../global';


@defineType(T => gql`
  type Container {
    item: ${T}
  }
`)
class Container<T> {
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
  constructor(public title: string) {}
}

describe('generics', () => {
  it('should build multiple type instances for each generic context', () => {
    const storage = getGlobalMetadataStorage();
    const bookContainerExp = new TypeExpression(Container, [new TypeExpression(Book, [])]);
    const bookContainerType = bookContainerExp.getType(storage, 'any') as GraphQLObjectType;
    expect(bookContainerType.name).toBe('BookContainer');

    const personContainerExp = new TypeExpression(Container, [new TypeExpression(Person, [])]);
    const personContainerType = personContainerExp.getType(storage, 'any') as GraphQLObjectType;
    expect(personContainerType.name).toBe('PersonContainer');
  });

  it('should throw an error when being built without generic context', () => {

  });
});
