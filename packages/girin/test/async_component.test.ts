import { Reducer, async, source } from "../src";


let fetchCount = 0;

interface PostSource {
  id?: number;
  title?: string;
  description?: string;
}

class Post extends Reducer<PostSource> {
  @source() id: number;

  async $fetch() {
    fetchCount += 1;
    return {
      title: `Post ${this.id}`,
      description: `Awesome post for topic ${this.id}`,
    };
  }

  @async() title: Promise<string>;
  @async() description: Promise<string>;

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
