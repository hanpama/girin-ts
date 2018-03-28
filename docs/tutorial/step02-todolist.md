# Girin Tutorial - Step 2: Todolist

In this tutorial, we will make a Todolist GraphQL server.

With Todolist server, we will be able to
* find all todo items
* add a new todo item
* toggle a todo item
* and delete a todo item

Before we start, please make sure that you have hello world codebase.

If you done have one, you can download hello world example from github repository, running:

```
curl https://codeload.github.com/hanpama/girin/tar.gz/master | tar -xz --strip=2 girin-master/example/tutorial-step01-hello-world
```

Your working directory will be like:

```
src/
  server.ts
tsconfig.json
package.json
```

## Database

Usually, GraphQL schema communicate with database servers, REST API endpoints, etc. but
in this tutorial we will use a simple `TodoDatabase` which is just a javascript object.

```
src/
  server.ts
  database.ts <-- new!
tsconfig.json
package.json
```

```typescript
// src/database.ts

export interface TodoSource {
  body: string;
  done: boolean;
}

export const TodoDatabase = {
  items: [
    { body: 'Hello, Girin', done: false },
  ] as Array<TodoSource | undefined>,

  findAll() {
    const items: Array<TodoSource | undefined> = this.items;
    return items
      .map((item, id)=> (item && ({ id, ...item })))
      .filter(item => item !== undefined);
  },
  insert(body: string) {
    const items: Array<TodoSource | undefined> = this.items;
    const item = { body, done: false };
    items.push(item);
    return { id: items.indexOf(item), ...item };
  },
  delete(id: number) {
    const items: Array<TodoSource | undefined> = this.items;
    const found = items[id];
    if (!found) { throw new Error('Todo item not found'); }
    delete items[id];
    return id;
  },
  toggle(id: number) {
    const items: Array<TodoSource | undefined> = this.items;
    const found = items[id];
    if (!found) { throw new Error('Todo item not found'); }
    found.done = !found.done;
    return { id, ...found };
  }
};
```

## Todo ObjectType


```
src/
  server.ts
  database.ts
  types.ts <-- new!
tsconfig.json
package.json
```

```typescript
// src/types.ts

import { Definition, gql } from 'girin';
import { TodoDatabase } from './database';

@Definition(gql`
  type Todo {
    id: Int!
    body: String!
    done: Boolean!
  }
`)
export class Todo {
  id: number;
  body: string;
  done: boolean;
}
```


## Query and Mutation

```typescript
// src/types.ts

import { Definition, gql } from 'girin';

// ... class Todo {}...

@Definition(gql`
  type Query {
    allTodos: [${Todo}]
  }
`)
export class Query {
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
export class Mutation {
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
```

Note that we directly inserted `Todo` class into GraphQL schema string.

## Connect to Schema

```typescript
// src/server.ts

import { GraphQLServer } from 'graphql-yoga';
import { GraphQLSchema } from 'graphql';
import { getGraphQLType } from 'girin';
// We will use Query and Mutation from ./types.ts
import { Query, Mutation } from './types';

// class Query from hello world deleted

export const schema = new GraphQLSchema({
  query: getGraphQLType(Query),
  mutation: getGraphQLType(Mutation),
});

const port = 8080;
const server = new GraphQLServer({ schema });

server.start({ port }).then(() => {
  console.log(`Runnig GraphQL server on ${port}`);
});
```

## Build and Run

```
$ tsc && node build/server.js
Runnig GraphQL server on 8080
```

It works!
You can check its schema is working with GraphiQL interface at http://localhost:8080.

You can check final code at https://github.com/hanpama/girin/tree/master/examples/tutorial-step02-todolist
