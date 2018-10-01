import { typedef, gql, getGraphQLType } from "@girin/typelink";
import { printSchema, GraphQLSchema } from "graphql";

import { ModelConnection, field, Model } from "..";
import { Edge, ConnectionArguments } from "../../relay";


@typedef(gql`
  type Post {
    id: String!
    title: String!
  }
`)
class Post extends Model {
  @field('_id') id: string;
  @field() title: string;
}

@typedef(gql`
  type PostEdge {
    node: ${Post}
    cursor: String
  }
`)
class PostEdge extends Edge<Post> {}

@typedef(gql`
  type PostConnection {
    edges: ${PostEdge}
    pageInfo: PageInfo
    count: Int
  }
`)
class PostConnection extends ModelConnection<Post> {
  count() {
    return Post.getManager().collection.count(this.options.selector);
  }
}

@typedef(gql`
  type Query {
    posts(first: Int, last: Int, before: String, after: String): ${PostConnection}
  }
`)
class Query {
  static posts(source: null, args: ConnectionArguments) {
    return new PostConnection(args, {
      modelClass: Post,
      maxLimit: 20,
      sortOptions: [{
        fieldName: '_id',
        order: 1
      }]
    })
  }
}

describe('Extending connection', () => {

  it('generates schema as expected', () => {
    const schema = new GraphQLSchema({
      query: getGraphQLType(Query),
    });
    expect(printSchema(schema)).toMatchSnapshot();
  })
})