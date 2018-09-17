import { Model, field, ModelConnectionBuilder } from "../src";
import { prepareTestClient } from "./testenv";
import { MongoClient } from "mongodb";


describe('index connection', () => {
  class Post extends Model {
    static collectionName = `model-connection-test`;

    @field() category: string;
    @field() createdAt: number;
  }

  const postByCreatedAt = new ModelConnectionBuilder({
    modelClass: Post,
    maxLimit: 10,
    sortOptions: [{ fieldName: 'createdAt', order: 1 }, { fieldName: '_id', order: -1 }]
  });

  const postByCategoryAndCreatedAt = new ModelConnectionBuilder({
    modelClass: Post,
    maxLimit: 10,
    sortOptions: [
      { fieldName: 'category', order: 1 },
      { fieldName: 'createdAt', order: 1 },
      { fieldName: '_id', order: -1 },
    ],
  });

  let client: MongoClient;

  beforeAll(async () => {
    client = await prepareTestClient();

    const posts = [];
    for (let i = 50; i > 0; i--) {
      posts.push({
        _id: `post${i}`,
        category: i % 2 ? 'Foo' : 'Bar',
        createdAt: new Date(2018, 0, 1, 0, i).getTime(),
      });
    }
    await Promise.all(posts.map(post => Post.insert(post)));
    return;
  })

  afterAll(async () => {
    await Post.getContext().db.dropDatabase();
    await client.close(true);
  });

  it('should initialize database and return proper query result', async () => {
    // 1 ~ 10
    let connection = postByCreatedAt.createConnection();
    let edges = await connection.edges;
    let pageInfo = await connection.pageInfo;
    expect(edges).toHaveLength(10);
    expect(edges[0].node._id).toBe('post1')
    expect(edges[9].node._id).toBe('post10')
    expect(pageInfo.hasPreviousPage).toBe(false);
    expect(pageInfo.hasNextPage).toBe(true);

    // pick 10
    const lastEdge = edges[edges.length - 1];

    // query after 10 should be 11 ~ 20
    connection = await postByCreatedAt.createConnection({ after: await lastEdge.cursor });
    edges = await connection.edges;
    pageInfo = await connection.pageInfo;
    expect(edges).toHaveLength(10);
    expect(edges[0].node._id).toBe('post11')
    expect(edges[9].node._id).toBe('post20')
    expect(pageInfo.hasPreviousPage).toBe(true);
    expect(pageInfo.hasNextPage).toBe(true);

    // take 11, 16 and get items between them
    const start = edges[0];
    const end = edges[5];
    connection = await postByCreatedAt.createConnection({
      after: await start.cursor,
      before: await end.cursor,
    });
    edges = await connection.edges;
    pageInfo = await connection.pageInfo;

    expect(edges).toHaveLength(4);
    expect(pageInfo.hasPreviousPage).toBe(true);
    expect(pageInfo.hasNextPage).toBe(true);
    expect(edges[0].node._id).toBe('post12');
    expect(edges[3].node._id).toBe('post15');

    // first 2 items after 11 before 16 should be post12 and post13
    connection = await postByCreatedAt.createConnection({
      after: await start.cursor,
      before: await end.cursor,
      first: 2,
    });
    edges = await connection.edges;
    pageInfo = await connection.pageInfo;

    expect(edges).toHaveLength(2);
    expect(edges[0].node._id).toBe('post12');
    expect(pageInfo.hasPreviousPage).toBe(true);
    expect(pageInfo.hasNextPage).toBe(true);

    // last 2 items after 11 before 16 should be post12 and post13
    connection = await postByCreatedAt.createConnection({
      after: await start.cursor,
      before: await end.cursor,
      last: 2,
    });
    edges = await connection.edges;
    pageInfo = await connection.pageInfo;
    expect(edges).toHaveLength(2);
    expect(edges[0].node._id).toBe('post14');
    expect(edges[1].node._id).toBe('post15');
    expect(pageInfo.hasPreviousPage).toBe(true);
    expect(pageInfo.hasNextPage).toBe(true);

    // last + first (error)
    expect(() => postByCreatedAt.createConnection({ last: 2, first: 2 })).toThrowError(
      'Argument "first" and "last" must not be included at the same time'
    );

    // last
    connection = await postByCreatedAt.createConnection({ last: 5 });
    edges = await connection.edges;
    pageInfo = await connection.pageInfo;

    expect(edges).toHaveLength(5);
    expect(edges[4].node._id).toBe('post50');
    expect(edges[3].node._id).toBe('post49');
    expect(pageInfo.hasPreviousPage).toBe(true);
    expect(pageInfo.hasNextPage).toBe(false);
  });

  it('should query with subconnection', async () => {
    const fooSelector = { category: 'Foo' };

    // 1 ~ 10
    let connection = postByCategoryAndCreatedAt
      .filter(fooSelector)
      .createConnection();
    let edges = await connection.edges;
    let pageInfo = await connection.pageInfo;

    expect(edges).toHaveLength(10);
    expect(edges[0].node._id).toBe('post1');
    expect(edges[1].node._id).toBe('post3');
    expect(edges[9].node._id).toBe('post19');
    expect(pageInfo.hasPreviousPage).toBe(false);
    expect(pageInfo.hasNextPage).toBe(true);

    // distinct category set
    const categorySet = edges.reduce((res, edge) => {
      res[edge.node.category] = true;
      return res;
    }, {} as any);
    expect(categorySet).toEqual({ Foo: true });

    // pick 10th
    const lastEdge = edges[edges.length - 1];

    // query after 10 should be 11 ~ 20
    connection = postByCategoryAndCreatedAt
      .filter(fooSelector)
      .createConnection({ after: await lastEdge.cursor });
    edges = await connection.edges;
    pageInfo = await connection.pageInfo;

    expect(edges).toHaveLength(10);
    expect(edges[0].node._id).toBe('post21');
    expect(edges[1].node._id).toBe('post23');
    expect(edges[9].node._id).toBe('post39');
    expect(pageInfo.hasPreviousPage).toBe(true);
    expect(pageInfo.hasNextPage).toBe(true);

    // take 11, 16 and get items between them
    const start = edges[0];
    const end = edges[5];
    connection = postByCategoryAndCreatedAt
      .filter(fooSelector)
      .createConnection({ after: await start.cursor, before: await end.cursor });
    edges = await connection.edges;
    pageInfo = await connection.pageInfo;

    expect(edges).toHaveLength(4);
    expect(edges[0].node._id).toBe('post23');
    expect(edges[3].node._id).toBe('post29');
    expect(pageInfo.hasPreviousPage).toBe(true);
    expect(pageInfo.hasNextPage).toBe(true);

    // first 2 items after 11 before 16 should be post12 and post13
    connection = postByCategoryAndCreatedAt
      .filter(fooSelector)
      .createConnection({ after: await start.cursor, before: await end.cursor, first: 2 });
    edges = await connection.edges;
    pageInfo = await connection.pageInfo;
    expect(edges).toHaveLength(2);
    expect(edges[0].node._id).toBe('post23');
    expect(edges[1].node._id).toBe('post25');
    expect(pageInfo.hasPreviousPage).toBe(true);
    expect(pageInfo.hasNextPage).toBe(true);

    // first 2 items after 11 before 16 should be post12 and post13
    connection = postByCategoryAndCreatedAt
      .filter(fooSelector)
      .createConnection({ after: await start.cursor, before: await end.cursor, last: 2 });
    edges = await connection.edges;
    pageInfo = await connection.pageInfo;
    expect(edges).toHaveLength(2);
    expect(edges[0].node._id).toBe('post27');
    expect(edges[1].node._id).toBe('post29');
    expect(pageInfo.hasPreviousPage).toBe(true);
    expect(pageInfo.hasNextPage).toBe(true);

    // in case of category Bar, it should work fine

    connection = postByCategoryAndCreatedAt.filter({ category: 'Bar' }).createConnection();
    edges = await connection.edges;
    pageInfo = await connection.pageInfo;
    expect(edges).toHaveLength(10);
    expect(edges[0].node._id).toBe('post2');
    expect(edges[1].node._id).toBe('post4');
    expect(edges[2].node._id).toBe('post6');
    expect(edges.map(edge => edge.node.category)).not.toContain('Foo');

    // no items with category Baz
    connection = postByCategoryAndCreatedAt.filter({ category: 'Baz' }).createConnection();
    edges = await connection.edges;
    expect(edges).toHaveLength(0);
  });
});
