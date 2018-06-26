import { GraphQLList } from 'graphql';

import { getGlobalMetadataStorage, List, TypeExpression } from '../src';


describe('createFromTypeString', () => {
  it('create expected type expression', () => {
    const boolean = new TypeExpression('Boolean');
    const type: any = boolean.buildTypeInstance(getGlobalMetadataStorage());
    expect(type.name).toBe('Boolean');
  });

  it('resolves itself as expected', () => {
    const complexExpression = new TypeExpression(() => List.of(new TypeExpression('String')));
    const resolved = complexExpression.resolve() as List;
    expect(resolved).toBeInstanceOf(List);
    expect(resolved.resolve()).toBe(resolved);
    expect(resolved.innerType).toBeInstanceOf(TypeExpression);
    expect(resolved.innerType.typeArg).toBe('String');

    const built = complexExpression.buildTypeInstance(getGlobalMetadataStorage());
    expect(built).toBeInstanceOf(GraphQLList);
  })
});
