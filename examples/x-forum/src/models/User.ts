import { defineType, gql } from '@girin/typelink';
import { User as BaseUser } from '@girin/framework/auth-local';

import { Post, Comment } from '.';


@defineType(gql`
  type User {
    id: String!
    username: String
    posts: ${Connection.of(Edge.of(Post))}
    comments: ${Connection.of(Edge.of(Comment))}
  }
`)
export class User extends BaseUser {
  posts() {

  }
}
