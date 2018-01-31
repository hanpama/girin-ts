import { GraphQLString } from 'graphql/type/scalars';

import { Generic } from '../src/metadata/Generic';
import { ObjectType } from '../src/decorators/ObjectType';


describe('Generic', () => {
  it('shoud parse properly', () => {
    let generic: Generic;

    generic = Generic.of('[String]!');
    expect(generic.getTypeInstance().toString()).toEqual('[String]!');

    @ObjectType()
    class Foo {}

    generic = Generic.of(Foo).nonNull().list();
    expect(generic.getTypeInstance().toString()).toEqual('[Foo!]');

    generic = Generic.of(GraphQLString).list().nonNull();
    expect(generic.getTypeInstance().toString()).toEqual('[String]!');
  });
});
