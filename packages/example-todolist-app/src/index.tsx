import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { ApolloProvider } from 'react-apollo';

import { TodoList } from './TodoList';
import { client } from './client';


ReactDOM.render(
  <ApolloProvider client={client}>
    <TodoList />
  </ApolloProvider>,
  document.getElementById('react-root')
);
