import { Component, source } from "../src/component";


interface AuthorSource {
  name: string;
  description: string;
}

class Author extends Component<AuthorSource> {
  @source() name: string;
  @source() description: string;
}


describe('Reducer', () => {
  describe('source decorator', () => {
    it('should works', () => {
      const author = new Author({ name: 'Foo', description: 'Bar'});
      expect(author.name).toBe('Foo');
      expect(author.description).toBe('Bar');
    });
  });
});
