import { Model, field, ModelConnection } from '../src';
import { prepareTestEnv, cleanUpTestEnv } from './testenv';
import { ConnectionArguments } from '@girin/connection';


describe('index connection', () => {
  class Post extends Model {
    static collectionName = `model-connection-test`;

    @field() slug: string;
    @field() category: string;
    @field() createdAt: number;
  }

  beforeAll(async () => {
    await prepareTestEnv();

    const posts = [];
    for (let i = 50; i > 0; i--) {
      posts.push({
        slug: `post${i}`,
        category: i % 2 ? 'Foo' : 'Bar',
        createdAt: new Date(2018, 0, 1, 0, i).getTime(),
      });
    }
    await Promise.all(posts.map(post => Post.insertOne(post)));
  });

  afterAll(async () => {
    await Post.getManager().db.dropCollection(Post.collectionName);
    await cleanUpTestEnv();
  });

  function queryPostsByCreatedAt(args: ConnectionArguments = {}) {
    return new ModelConnection(Post, args, {
      limit: 10,
      sortOptions: { createdAt: 1, slug: -1 },
    });
  }

  function queryPostsByCategoryAndCreatedAt(args: ConnectionArguments = {}, selector: any) {
    return new ModelConnection(Post, args, {
      limit: 10, selector,
      sortOptions: { category: 1, createdAt: 1, slug: -1 },
    });
  }

  it('implements relay cursor connection specification', async () => {
    // post1 ~ 10
    let connection = queryPostsByCreatedAt({ first: 10 });
    let edges = await connection.edges;
    let pageInfo = connection.pageInfo;
    expect(edges).toHaveLength(10);
    expect(edges[0].node.slug).toBe('post1');
    expect(edges[9].node.slug).toBe('post10');
    expect(await pageInfo.hasPreviousPage).toBe(false);
    expect(await pageInfo.hasNextPage).toBe(true);

    // pick 10
    const lastEdge = edges[edges.length - 1];

    // query after 10 should be 11 ~ 20
    connection = queryPostsByCreatedAt({ first: 10, after: lastEdge.cursor });
    edges = await connection.edges;
    pageInfo = connection.pageInfo;
    expect(edges).toHaveLength(10);
    expect(edges[0].node.slug).toBe('post11');
    expect(edges[9].node.slug).toBe('post20');
    expect(await pageInfo.hasPreviousPage).toBe(true);
    expect(await pageInfo.hasNextPage).toBe(true);

    // take 11, 16 and get items between them
    const start = edges[0];
    const end = edges[5];
    connection = queryPostsByCreatedAt({
      first: 10,
      after: start.cursor,
      before: end.cursor,
    });
    edges = await connection.edges;
    pageInfo = connection.pageInfo;

    expect(edges).toHaveLength(4);
    expect(await pageInfo.hasPreviousPage).toBe(true);
    expect(await pageInfo.hasNextPage).toBe(false);
    expect(edges[0].node.slug).toBe('post12');
    expect(edges[3].node.slug).toBe('post15');

    // first 2 items after 11 before 16 should be post12 and post13
    connection = queryPostsByCreatedAt({
      first: 2,
      after: start.cursor,
      before: end.cursor,
    });
    edges = await connection.edges;
    pageInfo = connection.pageInfo;

    expect(edges).toHaveLength(2);
    expect(edges[0].node.slug).toBe('post12');
    expect(await pageInfo.hasPreviousPage).toBe(true);
    expect(await pageInfo.hasNextPage).toBe(true);

    // last 2 items after 11 before 16 should be post14 and post15
    connection = queryPostsByCreatedAt({
      after: start.cursor,
      before: end.cursor,
      last: 2,
    });
    edges = await connection.edges;
    pageInfo = connection.pageInfo;
    expect(edges).toHaveLength(2);
    expect(edges[0].node.slug).toBe('post14');
    expect(edges[1].node.slug).toBe('post15');
    expect(await pageInfo.hasPreviousPage).toBe(true);
    expect(await pageInfo.hasNextPage).toBe(true);

    // last + first (error)
    expect(() => queryPostsByCreatedAt({ last: 2, first: 2 })).toThrowError(
      'Argument "first" and "last" must not be included at the same time'
    );

    // last
    connection = queryPostsByCreatedAt({ last: 5 });
    edges = await connection.edges;
    pageInfo = connection.pageInfo;

    expect(edges).toHaveLength(5);
    expect(edges[4].node.slug).toBe('post50');
    expect(edges[3].node.slug).toBe('post49');
    expect(await pageInfo.hasPreviousPage).toBe(true);
    expect(await pageInfo.hasNextPage).toBe(false);
  });

  it('works well with selectors', async () => {
    // 1 ~ 10
    let connection = queryPostsByCategoryAndCreatedAt({ first: 10 }, { category: 'Foo' });
    let edges = await connection.edges;
    let pageInfo = connection.pageInfo;

    expect(edges).toHaveLength(10);
    expect(edges[0].node.slug).toBe('post1');
    expect(edges[1].node.slug).toBe('post3');
    expect(edges[9].node.slug).toBe('post19');
    expect(await pageInfo.hasPreviousPage).toBe(false);
    expect(await pageInfo.hasNextPage).toBe(true);

    // distinct category set
    const categorySet = edges.reduce((res, edge) => {
      res[edge.node.category] = true;
      return res;
    }, {} as any);
    expect(categorySet).toEqual({ Foo: true });

    // pick 10th
    const lastEdge = edges[edges.length - 1];

    // query after 10 should be 11 ~ 20
    connection = queryPostsByCategoryAndCreatedAt({ first: 10, after: lastEdge.cursor }, { category: 'Foo' });
    edges = await connection.edges;
    pageInfo = connection.pageInfo;

    expect(edges).toHaveLength(10);
    expect(edges[0].node.slug).toBe('post21');
    expect(edges[1].node.slug).toBe('post23');
    expect(edges[9].node.slug).toBe('post39');
    expect(await pageInfo.hasPreviousPage).toBe(true);
    expect(await pageInfo.hasNextPage).toBe(true);

    // take 11, 16 and get items between them
    const start = edges[0];
    const end = edges[5];
    connection = queryPostsByCategoryAndCreatedAt(
      { first: 10, after: start.cursor, before: end.cursor },
      { category: 'Foo' },
    );
    edges = await connection.edges;
    pageInfo = connection.pageInfo;

    expect(edges).toHaveLength(4);
    expect(edges[0].node.slug).toBe('post23');
    expect(edges[3].node.slug).toBe('post29');
    expect(await pageInfo.hasPreviousPage).toBe(true);
    expect(await pageInfo.hasNextPage).toBe(false);

    // first 2 items after 11 before 16 should be post12 and post13
    connection = queryPostsByCategoryAndCreatedAt(
      { first: 2, after: start.cursor, before: end.cursor },
      { category: 'Foo' },
    );
    edges = await connection.edges;
    pageInfo = connection.pageInfo;
    expect(edges).toHaveLength(2);
    expect(edges[0].node.slug).toBe('post23');
    expect(edges[1].node.slug).toBe('post25');
    expect(await pageInfo.hasPreviousPage).toBe(true);
    expect(await pageInfo.hasNextPage).toBe(true);

    // last 2 items after 11 before 16 should be post12 and post13
    connection =  queryPostsByCategoryAndCreatedAt(
      { last: 2, after: start.cursor, before: end.cursor },
      { category: 'Foo' },
    );
    edges = await connection.edges;
    pageInfo = connection.pageInfo;
    expect(edges).toHaveLength(2);
    expect(edges[0].node.slug).toBe('post27');
    expect(edges[1].node.slug).toBe('post29');
    expect(await pageInfo.hasPreviousPage).toBe(true);
    expect(await pageInfo.hasNextPage).toBe(true);

    // in case of category Bar, it should work fine
    connection = queryPostsByCategoryAndCreatedAt({}, { category: 'Bar' });
    edges = await connection.edges;
    pageInfo = connection.pageInfo;
    expect(edges).toHaveLength(10);
    expect(edges[0].node.slug).toBe('post2');
    expect(edges[1].node.slug).toBe('post4');
    expect(edges[2].node.slug).toBe('post6');
    expect(edges.map(edge => edge.node.category)).not.toContain('Foo');

    // no items with category Baz
    connection = queryPostsByCategoryAndCreatedAt({}, { category: 'Baz' });
    edges = await connection.edges;
    expect(edges).toHaveLength(0);
  });
});
