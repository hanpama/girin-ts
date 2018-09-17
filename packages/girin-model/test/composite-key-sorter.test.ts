import { CompositeKeySorter } from "../src/utils/CompositeKeySorter";

test('collation index', () => {
  const cks = new CompositeKeySorter([
    [5, 4],
    [3, '1', 3],
    [1],
    [3, 10],
    [3, 8],
    ['F'],
  ]);
  expect(cks.indexOf([5, 4])).toBe(0);
  expect(cks.indexOf([3, '1', 3])).toBe(1);
  expect(cks.indexOf([1])).toBe(2);
  expect(cks.indexOf([3, 10])).toBe(3);
  expect(cks.indexOf([3, 8])).toBe(4);
  expect(cks.indexOf(['F'])).toBe(5);
});
