import { TypeExpression } from '../src/type-expression/TypeExpression';
import { globalMetadataStorage } from '../src/globalMetadataStorage';
// import { defineType, gql, List } from '../src';


describe('createFromTypeString', () => {
  it('create expected type expression', () => {
    const boolean = new TypeExpression('Boolean');
    const type: any = boolean.buildTypeInstance(globalMetadataStorage);
    expect(type.name).toBe('Boolean');
  });
});
