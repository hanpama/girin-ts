import { typedef, gql, field, Model } from "../../src";
import { Connection } from "../../src/database/connection/base";
import { ModelConnectionBuilder } from "girin-model";


@typedef(gql`
  """
  Users write posts
  """
  type Post {
    id: String!
    title: String!
  }

  extend type PostConnection {
    count
  }
`)
class Post extends Model {
  @field('_id') id: string;
  @field() title: string;
}

// how can we extend connections, edges.

@typedef(gql`
  type PostConnection {
    count: Int
  }
`)
class PostConnection extends Connection<Post> {
  // if Connection class has fields in metadata storage
  // we don't have to give any fields to it again.
  // or you can specify the edge type if you remake

  count() {
    this.queryBuilder.selectors
  }
}

// builder works fine but it is too verbose to use.
// connection query does not have to be 'predefined'.

new ModelConnectionBuilder({
  maxLimit: 20,
  modelClass: Post,
  connectionClass: PostConnection, // we can specify connection class like this.
  sortOptions: [
    { fieldName: '', order: 1 }
  ]
})

Post.queryConnection({ title: 1, id: 1 }).exec({ first: 4 })
// queryConnection has default max limit and Connection class
// it will return concrete instance

// when I tried to build a stuff like these with couchdb,
// there was a limitation of that couchdb should has specific index to run query on.
// but mongodb does not.
// querying connection is a very different concern.

// so the points are
// 1. building extensible Connection class.
// 2. design nice API to run a connection query

// 3. how to deal with 'generic' connection type.
//    - with existing generic [x] -- not good, i think

// users face the moment of refering type object
