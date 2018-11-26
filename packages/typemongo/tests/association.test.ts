import 'reflect-metadata';

import { Model, hasMany, field, hasOne, HasMany, HasOne } from '../src';
import { prepareTestEnv, cleanUpTestEnv } from './testenv';


class User extends Model {
  static collectionName = 'association_users';
  @field() username: string;
}

class Comment extends Model {
  static collectionName = 'association_comments';
  @field() content: string;

  @hasOne(User) author: HasOne<User>;
}

class Post extends Model {
  static collectionName = 'association_posts';
  @field() content: string;

  @hasOne(User) author: HasOne<User>;
  @hasMany(Comment) comments: HasMany<Comment>;
}


describe('association', () => {

  beforeAll(prepareTestEnv);
  afterAll(async () => {
    await User.getManager().db.dropCollection(User.collectionName);
    await cleanUpTestEnv();
  });

  it('allows to assign related documents by using set()', async () => {
    const user = new User({ username: 'hanpama' });
    await user.$save();

    const post = new Post();
    post.content = 'My first post';
    post.author.set(user);

    await post.$save();

    const comment = new Comment();
    comment.content = 'hi!';
    comment.author.set(user);
    await comment.$save();

    post.comments.set([comment]);
    await post.$save();

    const fetchedPost = await Post.getOne(post._id) as Post;
    const fetchedUser = await fetchedPost.author as User;
    const fetchedComments = await fetchedPost.comments as Comment[];

    expect(fetchedUser.id).toBe(user.id);
    expect(fetchedComments.map(c => c.id)).toEqual([comment.id]);
  });
});
