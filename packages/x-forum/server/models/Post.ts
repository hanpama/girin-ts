import { typedef, gql, Model, field } from 'girin';
import { User } from './User';
import { ObjectID } from 'bson';
import { Context } from '../context';
import { Comment } from './Comment';
import { ObjectIDType } from 'girin/database';


@typedef(gql`
  type Post {
    id: ${ObjectIDType}!
    title: String!
    content: String!
    category: String!
    author: ${() => User}!
    createdAt: String!
    comments: [${() => Comment}]
  }
  input PostInput {
    title: String!
    content: String!
    category: String!
  }

  extend type Query {
    posts: [${Post}]
  }
  extend type Mutation {
    createPost(post: ${Post}!): ${Post}!
  }
`)
export class Post extends Model {
  static collectionName = 'posts';

  @field() title: string;
  @field() content: string;
  @field() category: string;
  @field() userId: ObjectID;
  @field() createdAt: string;

  author() {
    return User.getOne(this.userId);
  }
  comments() {
    return Comment.findMany({ parentPostId: this._id });
  }

  static posts() {
    return Post.findMany({});
  }
  static createPost(_source: null, args: { post: Post }, ctx: Context) {
    if (!ctx.user) {
      throw new Error('Not Authenticated');
    }
    const { post } = args;
    post.userId = ctx.user._id;
    post.createdAt = new Date().toISOString();
    return post.$save();
  }
}
