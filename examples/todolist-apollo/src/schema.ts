import { Definition, gql, getGraphQLType } from 'girin';
import { GraphQLSchema } from 'graphql';

import { TodoDatabase } from './database';


@Definition(gql`
  type Todo {
    id: Int!
    body: String!
    done: Boolean!
  }
`)
class Todo {
  id: number;
  body: string;
  done: boolean;
}

@Definition(gql`
  type Query {
    allTodos: [${Todo}]
  }
`)
class Query {
  static allTodos() {
    return TodoDatabase.findAll()
  }
}

@Definition(gql`
  type Mutation {
    createTodo(body: String!): ${Todo}!
    toggleTodo(id: Int!): ${Todo}!
    deleteTodo(id: Int!): Int!
  }
`)
class Mutation {
  static createTodo(source: null, { body }: { body: string }) {
    return TodoDatabase.insert(body);
  }

  static toggleTodo(source: null, { id }: { id: number }) {
    return TodoDatabase.toggle(id);
  }

  static deleteTodo(source: null, { id }: { id: number }) {
    return TodoDatabase.delete(id);
  }
}

export const schema = new GraphQLSchema({
  query: getGraphQLType(Query),
  mutation: getGraphQLType(Mutation),
});
