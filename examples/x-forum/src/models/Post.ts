import { defineType, gql } from '@girin/typelink';
import { Model, field, one } from '@girin/mongodb';
import { User } from '@girin/framework/auth-local';

import { Comment } from './Comment';
import { ForumContext } from '../context';
import { ObjectID } from 'bson';
import { ConnectionArguments } from '@girin/relay/connection';


@defineType(gql`
  type Post {
    id: String!
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
  @field() title: string;
  @field() content: string;
  @field() category: string;
  @field() createdAt: string;
  @one(User) author: User;

  comments() {
    return Comment.findMany({ parentPost: this._id });
  }

  static posts() {
    return this.findMany({});
  }
  static createPost(_source: null, args: { post: Post }, ctx: ForumContext) {
    if (!ctx.user) {
      throw new Error('Not Authenticated');
    }
    const { post } = args;
    post.author = ctx.user;
    post.createdAt = new Date().toISOString();
    return post.$save();
  }

  static findPostConnectionByUser(userId: ObjectID, args: ConnectionArguments) {
    return this.findConnection(args, {
      limit: 10,
      selector: { author: userId },
      sortOptions: { createdAt: -1, _id: 1, }
    });
  }
}
