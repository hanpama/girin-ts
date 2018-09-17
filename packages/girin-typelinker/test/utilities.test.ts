import { formatObjectInfo } from "../src/utilities/formatObjectInfo";

test('formatObjectInfo', () => {
  class Foo {}

  expect(formatObjectInfo(Foo)).toBe('Foo<function>');
  expect(formatObjectInfo(new Foo())).toBe('[object Object]<Foo>');
  expect(formatObjectInfo(3)).toBe('3<Number>');
  expect(formatObjectInfo(null)).toBe('null<null>');
  expect(formatObjectInfo(undefined)).toBe('undefined<undefined>');
  expect(formatObjectInfo('STR')).toBe('STR<String>');
  expect(formatObjectInfo({})).toBe('[object Object]<Object>');
  expect(formatObjectInfo(Object)).toBe('Object<function>');
  expect(formatObjectInfo((() => {}))).toBe('[anonymous function]<function>');
});
