# Girin Tutorial - Step 1: Hello, world!

In this tutorial, we are going to make a simple but working hello world schema with girin.

Hello world schema will be served with [`graphql-yoga`](https://github.com/graphcool/graphql-yoga),
fully-featured GraphQL server without verbose configurations.

## Initialization

First, make your project directory and initialize `package.json` and project's dependencies.

```sh
mkdir girin-todo
cd girin-todo
npm init -y
npm install girin graphql typescript graphql-yoga --save
```

After installing required packages, create `tsconfig.json` as shown below.

```json
{
  "version": "2.6.1",
  "compilerOptions": {
      "lib": ["es5", "es6", "esnext.asynciterable"],
      "target": "es5",
      "module": "commonjs",
      "moduleResolution": "node",
      "emitDecoratorMetadata": true,
      "experimentalDecorators": true,
      "outDir": "build/"
  },
  "include": [ "src/" ],
  "exclude": [ "node_modules" ]
}
```

We will use decorators so make sure that `experimentalDecorators` is set to true.

## Type Definition

Girin framework provides `@Definition()` decorator and `gql()` template tag.
You can decorate a class which you want to make a GraphQL type from.

Let's define a minimal `Query` object type which will be used as root query type.

```typescript
// src/server.ts
import { Defintion, gql } from 'girin';

@Definition(gql`
  type Query {
    hello: String
  }
`)
class Query {
  static hello() {
    return 'Hello, world';
  }
}
```

## Create Schema

You can get corresponding `GraphQLType` of class with `getGraphQLType()` function by passing it as an argument.
In this example, you are getting type `Query` to provide it to `GraphQLSchema` constructor.

```typescript
// src/server.ts
import { Definition, gql, getGraphQLType } from 'girin';
import { GraphQLSchema } from 'graphql';

// ... class Query {} ...

const schema = new GraphQLSchema({
  query: getGraphQLType(Query), // get GraphQLType of class Query
});
```


## Serving GraphQL Schema

```typescript
// src/server.ts
import { GraphQLServer } from 'graphql-yoga'; // <-- import GraphQLServer
import { Definition, gql, getGraphQLType } from 'girin';
import { GraphQLSchema } from 'graphql';

// ... class Query {} ...
// ... const schema ...

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

In this example, we wrote all our code in a single file, but later we can separate and modularize things into each files.

You can check final code at https://github.com/hanpama/girin/tree/master/examples/tutorial-step01-hello-world
