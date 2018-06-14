import { Field } from '../src';
import { globalMetadataStorage } from '../src/globalMetadataStorage';


describe('field configuration', () => {
  test('field builder override', () => {
    const field = new Field({
      output: 'String',
      args: [],
      buildResolver() {
        return () => 'TEST';
      }
    });
    const resolver = field.buildResolver(globalMetadataStorage);
    expect((resolver as any)()).toBe('TEST');
  });
});
