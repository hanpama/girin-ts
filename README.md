# Girin: Server-side GraphQL Framework 🦒

Build better GraphQL schema with less code
* defining schema, not generating it
* modularizing your GraphQL schema into components

[![npm version](https://badge.fury.io/js/girin.svg)](https://badge.fury.io/js/girin)
[![Build Status](https://travis-ci.org/hanpama/girin.svg?branch=master)](https://travis-ci.org/hanpama/girin)
[![codecov](https://codecov.io/gh/hanpama/girin/branch/master/graph/badge.svg)](https://codecov.io/gh/hanpama/girin)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/) [![Greenkeeper badge](https://badges.greenkeeper.io/hanpama/girin.svg)](https://greenkeeper.io/)

> This project is in development. not stable!

## Features

* Use GraphQL Schema Definition Language to expose classes to API
* TypeORM support with relay compliant cursor connections
* Password authentication based on JWT


## How it looks like

```ts
import { girin } from '@girin/framework';
import { defineType, gql } from '@girin/typelink';

@defineType(gql`
  type Query {
    hello: String!
  }
`)
class Query {
  static hello() {
    return 'World!'
  }
}

girin({ SCHEMA: { Query } }).run();
```
<!--
## Get started

```sh
npm install girin graphql
```

`@girin/framework` package is for bootstrapping server with your schema.

`@girin/typelink` package provides decorator and `gql` template tag,
a SDL parser for linking class to GraphQL type. -->


## Development

### Initialization

```sh
# 1. clone the repository
git clone https://github.com/hanpama/girin

# 2. cd into it
cd girin

# 3. install dependency and link packages
npm run bootstrap

# 4. run typescript compiler server
npm run watch
```

### Testing and Debugging

```
npm test
```
