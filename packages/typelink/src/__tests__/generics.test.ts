import { GraphQLObjectType } from 'graphql';

import { defineType, gql } from '..';
import { DefinitionTypeExpression, List, TypeResolvingContext } from '../type-expression';
import { getGlobalMetadataStorage, getType } from '../global';


@defineType(T => gql`
  type One {
    item: ${T}
  }
`)
class One<T> {
  constructor(public item: T) {}
}

@defineType(T => gql`
  type Many {
    items: ${List.of(T)}
  }
`)
class Many<T> {
  constructor(public items: T[]) {}
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
  const context: TypeResolvingContext = {
    storage, kind: 'any', generic: [],
  };

  it('should build multiple type instances for each generic context', () => {

    const bookOneExp = new DefinitionTypeExpression(One, [new DefinitionTypeExpression(Book, [])]);
    const bookOneType = bookOneExp.getType(context) as GraphQLObjectType;
    expect(bookOneType.name).toBe('BookOne');
    expect(bookOneType.getFields().item.type).toBe(getType(Book));

    const personOneExp = new DefinitionTypeExpression(One, [new DefinitionTypeExpression(Person, [])]);
    const personOneType = personOneExp.getType(context) as GraphQLObjectType;
    expect(personOneType.name).toBe('PersonOne');
    expect(personOneType.getFields().item.type).toBe(getType(Person));
  });

  it('should resolve nested generic expressions', () => {
    const bookOneManyExp = new DefinitionTypeExpression(
      Many, [
        new DefinitionTypeExpression(
          One, [
            new DefinitionTypeExpression(
              Book, []
            )
          ]
        )
      ]
    );
    const bookOneManyType = bookOneManyExp.getType(context) as GraphQLObjectType;
    expect(bookOneManyType.name).toBe('BookOneMany');
  });

  // it('should resolve nested generic expressions', () => {
  //   const GenericManyOne = new DefinitionTypeExpression(Many, [
  //     new DefinitionTypeExpression(One, [
  //       genericParameters[0]
  //     ]),
  //     genericParameters[1]
  //   ]);

  //   GenericManyOne.getType(storage, 'any', [Book]);

  //   new TypeExpression(GenericManyOne, [Book])
  //   const bookOneManyType = bookOneManyExp.getType(storage, 'any') as GraphQLObjectType;
  //   expect(bookOneManyType.name).toBe('BookOneMany');
  // });

  // it('should throw an error when being built without generic context', () => {

  // });
});
