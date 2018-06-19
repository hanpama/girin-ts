import { AsyncSourceFetcher } from "../src/fetcher/AsyncSourceFetcher";


let fetchCount = 0;

class Post extends AsyncSourceFetcher<any, {}, number> {
  async fetch(id: number) {
    fetchCount += 1;

    return {
      title: `Post ${id}`,
      description: `Awesome post for topic ${id}`,
    };
  }

  title: Promise<string>;
  description: Promise<string>;

  tiscription() {
    return Promise
      .all([this.title, this.description])
      .then(texts => texts.join(' '));
  }
}

describe('AsyncSourceFetcher', () => {
  it('should lazily fetch data', async () => {
    const post = new Post(3);
    expect(fetchCount).toBe(0);

    expect(await post.title).toBe('Post 3');
    expect(fetchCount).toBe(1);

    expect(await post.description).toBe('Awesome post for topic 3');
    expect(fetchCount).toBe(1);

    expect(await post.tiscription()).toBe('Post 3 Awesome post for topic 3');
    expect(fetchCount).toBe(1);
  });
});
