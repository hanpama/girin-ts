import { GraphQLObjectType } from 'graphql';

import { defineType, gql } from '..';
import { TypeExpression } from '../metadata';
import { getGlobalMetadataStorage } from '../global';


@defineType(T => gql`
  type Inner {
    item: ${T}
  }
`)
class Inner<T> {
  constructor(public item: T) {}
}

@defineType(T => gql`
  type Outer {
    item: ${T}
  }
`)
class Outer<T> {
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
  const storage = getGlobalMetadataStorage();
  it('should build multiple type instances for each generic context', () => {
    const bookInnerExp = new TypeExpression(Inner, [new TypeExpression(Book, [])]);
    const bookInnerType = bookInnerExp.getType(storage, 'any') as GraphQLObjectType;
    expect(bookInnerType.name).toBe('BookInner');

    const personInnerExp = new TypeExpression(Inner, [new TypeExpression(Person, [])]);
    const personInnerType = personInnerExp.getType(storage, 'any') as GraphQLObjectType;
    expect(personInnerType.name).toBe('PersonInner');
  });

  it('should resolve nested generic expressions', () => {
    const bookInnerOuterExp = new TypeExpression(
      Outer, [
        new TypeExpression(
          Inner, [
            new TypeExpression(
              Book, []
            )
          ]
        )
      ]
    );
    const bookInnerOuterType = bookInnerOuterExp.getType(storage, 'any') as GraphQLObjectType;
    expect(bookInnerOuterType.name).toBe('BookInnerOuter');
  });

  it('should throw an error when being built without generic context', () => {

  });
});
