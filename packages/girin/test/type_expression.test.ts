import { TypeExpression } from '../src/type-expression/TypeExpression';
import { globalMetadataStorage } from '../src/globalMetadataStorage';
import { defineType, gql, List } from '../src';


describe('createFromTypeString', () => {
  it('create expected type expression', () => {
    const boolean = new TypeExpression('Boolean');
    const type: any = boolean.buildTypeInstance(globalMetadataStorage);
    expect(type.name).toBe('Boolean');
  });

  test('default InputObjectType instantiator', () => {

    @defineType(gql`
      input MemberInput {
        name: String!
        email: String!
      }
    `)
    class MemberInput {
      public name: string;
      public email: string;
    }

    const expression = new TypeExpression(MemberInput);
    const instantiate = expression.buildInstantiator(globalMetadataStorage);
    const input = instantiate({ name: 'Foo', email: 'foo@example.com' });

    expect(input.name).toBe('Foo');
    expect(input.email).toBe('foo@example.com');
    expect(input).toBeInstanceOf(MemberInput);
  });

  test('default ObjectType instantiator', () => {

    @defineType(gql`
      type Member {
        name: String!
        email: String!
      }
    `)
    class Member {
      public name: string;
      public email: string;
    }

    const expression = new TypeExpression(Member);
    const instantiate = expression.buildInstantiator(globalMetadataStorage);
    const input = instantiate({ name: 'Foo', email: 'foo@example.com' });

    expect(input.name).toBe('Foo');
    expect(input.email).toBe('foo@example.com');
    expect(input).toBeInstanceOf(Member);
  });

  test('custom instantiators and structure types', () => {
    @defineType(gql`
      input GreetingInput {
        greeting: String
        name: String!
      }
    `)
    class GreetingInput {
      static instantiate(values: { greeting?: string, name: string}) {
        const greeting = new GreetingInput();
        greeting.message = `${values.greeting || 'Hello'}, ${values.name}`;
        return greeting;
      }

      public message: string;
    }

    let expression = new TypeExpression(GreetingInput);
    let instantiate = expression.buildInstantiator(globalMetadataStorage);
    let input = instantiate({ name: 'Foo' });

    expect(input.message).toBe('Hello, Foo');
    expect(input).toBeInstanceOf(GreetingInput);


    expression = List.of(GreetingInput);
    instantiate = expression.buildInstantiator(globalMetadataStorage);
    const listOfInput: GreetingInput[] = instantiate([
      { name: 'Foo' }, { name: 'Bar' }, { name: 'Baz', greeting: '안녕' }
    ]);
    expect(listOfInput.map(item => item.message)).toEqual([
      'Hello, Foo', 'Hello, Bar', '안녕, Baz'
    ]);
    expect(listOfInput.map(item => item instanceof GreetingInput)).toEqual([
      true, true, true
    ]);
  });

});
