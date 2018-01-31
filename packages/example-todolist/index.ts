import { GraphQLServer } from 'graphql-yoga';
import { ObjectType, Field, Argument, getGraphQLType } from 'girin';
import { GraphQLSchema } from 'graphql/type/schema';


interface TodoSource {
  id: number;
  body: string;
  done: boolean;
}

let todos: TodoSource[] = [
  { id: 1, body: 'Hello, Girin', done: false },
];

@ObjectType()
class Todo {
  constructor(source: TodoSource) {
    this.id = source.id;
    this.body = source.body;
    this.done = source.done;
  }
  @Field('Int!')
  id: number;

  @Field('String!')
  body: string;

  @Field('Boolean!')
  done: boolean;
}

@ObjectType()
class Query {
  @Field('[Todo]')
  allTodos() {
    return todos.map(source => new Todo(source));
  }
}

@ObjectType()
class Mutation {
  @Field('Todo!')
  createTodo(
    @Argument('body: String!') body: string,
  ) {
    const id = Math.max(...todos.map(todo => todo.id)) + 1;
    const newTodoSource = { id, body, done: false };
    todos.push(newTodoSource);
    return new Todo(newTodoSource);
  }

  @Field('Todo!')
  toggleTodo(
    @Argument('id: Int!') id: number,
  ) {
    const found = todos.find(todo => todo.id === id);
    if (!found) { throw new Error('Todo item not found'); }
    found.done = !found.done;
    return new Todo(found);
  }

  @Field('Int!')
  deleteTodo(
    @Argument('id: Int!') id: number,
  ) {
    const found = todos.findIndex(todo => todo.id === id);
    if (found === -1) { throw new Error('Todo item not found'); }
    todos = [...todos.slice(0, found), ...todos.slice(found + 1, todos.length)];
    return id;
  }
}

const schema = new GraphQLSchema({
  query: getGraphQLType(Query),
  mutation: getGraphQLType(Mutation),
});

const server = new GraphQLServer({ schema });

const options = {
  port: 8000,
  endpoint: '/graphql',
  subscriptions: '/subscriptions',
  playground: '/playground',
}

server.start(options)
  .then(() => console.log(`Server is running on http://localhost:${options.port}`));
