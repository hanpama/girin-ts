import { GraphQLSchema, printSchema } from "graphql";

import { ObjectType, Definition, gql, getGraphQLType } from "../src";
import { DefinitionClass } from "../src/types";


@Definition.define(gql`
  type Edge {
    node: ${Edge => Edge.nodeType}
  }
`)
abstract class Edge<TNode> {
  static nodeType: DefinitionClass;
  node: TNode;
}

@ObjectType.define(gql`
  type Post {
    title: String!
  }
`)
class Post {
  title: string;
}

@ObjectType.define(gql`
  type Author {
    name: String!
  }
`)
class Author {
  name: string;
}

@ObjectType.define()
class PostEdge extends Edge<Post> {
  static nodeType = Post;
}

@ObjectType.define()
class AuthorEdge extends Edge<Author> {
  static nodeType = Author;
}

@ObjectType.define(gql`
  type Query {
    postEdge: ${PostEdge}
    authorEdge: ${AuthorEdge}
  }
`)
class Query {

}

describe('Lazy-generic TypeArgs', () => {
  it('should generate schema as expected', () => {
    const schema = new GraphQLSchema({
      query: getGraphQLType(Query),
    });

    expect(printSchema(schema)).toMatchSnapshot();

  });
});
