import { Component, async, source } from "../src/component";


let fetchCount = 0;

interface PostSource {
  id?: number;
  title?: string;
  description?: string;
}

class Post extends Component<PostSource> {
  async $fetch() {
    const id = this.$source.id;
    fetchCount += 1;

    return {
      title: `Post ${id}`,
      description: `Awesome post for topic ${id}`,
    };
  }

  @source()
  id: number;

  @async()
  title: Promise<string>;

  @async()
  description: Promise<string>;

  tiscription() {
    return Promise
      .all([this.title, this.description])
      .then(texts => texts.join(' '));
  }
}

describe('AsyncSourceFetcher', () => {
  it('should lazily fetch data', async () => {
    const post1 = new Post({ id: 1 });
    expect(fetchCount).toBe(0);

    const post2 = new Post({ id: 2 });
    expect(fetchCount).toBe(0);

    expect(post1.id).toBe(1);
    expect(fetchCount).toBe(0);

    expect(post2.id).toBe(2);
    expect(fetchCount).toBe(0);

    expect(await post1.title).toBe('Post 1');
    expect(fetchCount).toBe(1);

    expect(await post2.title).toBe('Post 2');
    expect(fetchCount).toBe(2);

    expect(await post1.title).toBe('Post 1');
    expect(fetchCount).toBe(2);

    expect(await post1.description).toBe('Awesome post for topic 1');
    expect(fetchCount).toBe(2);

    expect(await post1.tiscription()).toBe('Post 1 Awesome post for topic 1');
    expect(fetchCount).toBe(2);
  });
});
