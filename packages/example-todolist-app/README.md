# Girin-Todolist

Example todolist app with [Girin framework](https://github.com/hanpama/girin)

## Schema

```typescript
@Definition(gql`
  type Todo {
    id: Int!
    body: String!
    done: Boolean!
  }
`)
class Todo implements TodoSource {
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
    return todos;
  }
}


@Definition(gql`
  type Mutation {
    createTodo(body: String!): ${Todo}!
    toggleTodo(id: Int!): Todo!
    deleteTodo(id: Int!): Int!
  }
`)
class Mutation {
  static createTodo(source: null, { body }: { body: string }) {
    const id = todos.length > 0 ? Math.max(...todos.map(todo => todo.id)) + 1 : 1;
    const newTodoSource = { id, body, done: false };
    todos.push(newTodoSource);
    return newTodoSource;
  }

  static toggleTodo(source: null, { id }: { id: number }) {
    const found = todos.find(todo => todo.id === id);
    if (!found) { throw new Error('Todo item not found'); }
    found.done = !found.done;
    return found;
  }

  static deleteTodo(source: null, { id }: { id: number }) {
    const found = todos.findIndex(todo => todo.id === id);
    if (found === -1) { throw new Error('Todo item not found'); }
    todos = [...todos.slice(0, found), ...todos.slice(found + 1, todos.length)];
    return id;
  }
}

export const schema = new GraphQLSchema({
  query: getGraphQLType(Query),
  mutation: getGraphQLType(Mutation),
});
```