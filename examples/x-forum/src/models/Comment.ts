import { defineType, gql } from '@girin/typelink';
import { Model, field, one, many } from '@girin/mongodb';
import { loginRequired } from '@girin/framework/auth-local';

import { User, Post } from '.';
import { ForumContext } from '../context';


@defineType(gql`
  type Comment {
    id: String!
    author: ${() => User}!
    content: String!
    parentPost: ${() => Post}!
    votes: Int!
    voters: [${() => User}]!
  }

  input CommentInput {
    parentPost: ${() => Post}!
    content: String!
  }
`)
export class Comment extends Model {
  @field() content: string;
  @one(User) author: User;
  @one(Post) parentPost: Post;
  @many(User) voters: User[];
  @field() votes: number;

  async validate() {
    if (!await this.parentPost.$exists()) {
      throw new Error('No matched post for its parentPost');
    }
    if (!this.author.$exists()) {
      throw new Error('No matched user for its author');
    }
  }
}

@defineType(gql`
  extend type Mutation {
    createComment(comment: ${Comment}!): ${Comment}
    deleteComment(commentId: String): String
    voteComment(commentId: String!): ${Comment}
    unvoteComment(commentId: String!): ${Comment}
  }
`)
export class CommentMutation {

  @loginRequired()
  static async createComment(_source: null, args: { comment: Comment }, context: ForumContext) {
    const { comment } = args;

    comment.author = context.user;
    comment.votes = 0;
    comment.voters = [];

    await comment.validate();
    await comment.$save();
    return comment;
  }

  @loginRequired()
  static async voteComment(_source: null, args: { commentId: string }, context: ForumContext) {
    const commentId = new ObjectID(args.commentId);
    const userId = context.user._id;

    const updateResult = await Comment.getManager().collection.updateOne({ // TODO: make shortcut
      _id: commentId,
      voterIds: { $not: { $elemMatch: { $eq: userId } } },
    }, {
      $inc: { votes: 1 },
      $push: { voterIds: userId },
    });

    if (updateResult.modifiedCount !== 1) {
      throw new Error('Invalid vote');
    }
    return Comment.getOne(commentId);
  }

  @loginRequired()
  static async unvoteComment(_source: null, args: { commentId: string }, context: AuthLocalContext) {
    const commentId = new ObjectID(args.commentId);
    const userId = context.user._id;

    const updateResult = await Comment.getManager().collection.updateOne({
      _id: commentId,
      voterIds: { $elemMatch: { $eq: userId } },
    }, {
      $inc: { votes: -1 },
      $pull: { voterIds: userId },
    });

    if (updateResult.modifiedCount !== 1) {
      throw new Error('Invalid unvote');
    }
    return Comment.getOne(commentId);
  }
}
