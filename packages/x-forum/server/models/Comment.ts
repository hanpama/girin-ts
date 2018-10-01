import { typedef, gql, Model } from "girin";
import { User } from "./User";
import { field, ObjectIDType } from "girin/database";
import { ObjectID } from "bson";
import { Post } from "./Post";
import { Context } from "../context";


@typedef(gql`
  type Comment {
    id: ${ObjectIDType}!
    author: ${() => User}!
    content: String!
    parentPost: ${() => Post}!
    votes: Int!
    voters: [${() => User}]!
  }

  input CommentInput {
    parentPostId: ${ObjectIDType}!
    content: String!
  }

  extend type Mutation {
    createComment(comment: ${Comment}!): ${Comment}
    deleteComment(commentId: ObjectID): ${ObjectID}
    voteComment(commentId: String!): ${Comment}
    unvoteComment(commentId: String!): ${Comment}
  }
`)
export class Comment extends Model {
  @field() content: string;
  @field() parentPostId: ObjectID;

  @field() votes: number;
  @field() voterIds: ObjectID[];
  voters() { return User.getMany(this.voterIds); }

  @field() authorId: ObjectID;
  author() { return User.getOne(this.authorId); }

  static async createComment(_source: null, args: { comment: Comment }, context: Context) {
    const { comment } = args;
    comment.authorId = context.user._id;
    await comment.$save();
    return comment;
  }

  static async voteComment(_source: null, args: { commentId: string }, context: Context) {
    const commentId = new ObjectID(args.commentId);
    const userId = context.user._id;

    const updateResult = await this.getManager().collection.updateOne({ // TODO: make shortcut
      _id: commentId,
      voterIds: { $not: { $elemMatch: { $eq: userId } } },
    }, {
      $inc: { votes: 1 },
      $push: { voterIds: userId },
    });

    if (updateResult.modifiedCount !== 1) {
      throw new Error('Invalid vote');
    }
    return this.getOne(commentId);
  }

  static async unvoteComment(_source: null, args: { commentId: string }, context: Context) {
    const commentId = new ObjectID(args.commentId);
    const userId = context.user._id;

    const updateResult = await this.getManager().collection.updateOne({
      _id: commentId,
      voterIds: { $elemMatch: { $eq: userId } },
    }, {
      $inc: { votes: -1 },
      $pull: { voterIds: userId },
    });

    if (updateResult.modifiedCount !== 1) {
      throw new Error('Invalid unvote');
    }
    return this.getOne(commentId);
  }
}
