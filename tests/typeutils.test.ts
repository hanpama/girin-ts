import { equalsOrInherits } from '../src';


test('isSubClassOf', () => {

  class Foo {}
  class Bar extends Foo {}
  class Baz extends Bar {}

  expect(equalsOrInherits(Foo, Foo)).toBe(true);
  expect(equalsOrInherits(Bar, Foo)).toBe(true);
  expect(equalsOrInherits(Baz, Foo)).toBe(true);
  expect(equalsOrInherits(Baz, Bar)).toBe(true);
  expect(equalsOrInherits(Foo, Bar)).toBe(false);
  expect(equalsOrInherits(Foo, Baz)).toBe(false);
});
