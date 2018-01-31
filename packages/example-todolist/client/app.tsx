import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider, graphql, ChildProps } from 'react-apollo';
import gql from 'graphql-tag';


const client = new ApolloClient({
  link: new HttpLink({ uri: 'http://localhost:8000/graphql' }),
  cache: new InMemoryCache()
});


class AppComponent extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      buffer: ''
    };
  }

  toggleItem(id: number) {
    client.mutate({
      mutation: gql`
        mutation($id: Int!) {
          toggleTodo(id: $id) {
            id
            body
            done
          }
        }
      `,
      variables: { id },
    })
  }

  deleteTodo(id: number) {
    client.mutate({
      mutation: gql`
        mutation($id: Int!) {
          deleteTodo(id: $id)
        }
      `,
      variables: { id },
    }).then(() => {
      this.props.data.refetch();
    });
  }

  createTodo() {
    client.mutate({
      mutation: gql`
        mutation($body: String!) {
          createTodo(body: $body) {
            id
            body
            done
          }
        }
      `,
      variables: { body: this.state.buffer },
    }).then(() => {
      this.setState({ buffer: '' });
      this.props.data.refetch();
    });
  }

  render() {
    return (
      <div style={{ maxWidth: '720px', margin: '100px auto' }}>
        <h1>Todos!</h1>
        <ul className="list-group">
        {
          this.props.data.loading
          ? <li className="list-group-item">loading...</li>
          : this.props.data.allTodos.map(todo => (
              <li key={todo.id} className="list-group-item d-flex justify-content-between align-items-center">
                <span>
                  <input
                    type="checkbox"
                    onChange={() => this.toggleItem(todo.id)}
                    checked={todo.done}
                  /> {todo.body}
                </span>
                <button
                  className="btn btn-primary"
                  onClick={() => this.deleteTodo(todo.id)}
                >
                  delete
                </button>
              </li>
            ))
        }
        </ul>
        <form onSubmit={(e) => {
          e.preventDefault();
          this.createTodo();
        }}>
          <input
            className="form-control"
            type="text"
            value={this.state.buffer}
            onChange={e => this.setState({ buffer: e.currentTarget.value })}
          />
        </form>
      </div>
    );
  }
}

const App = graphql(gql`
  query {
    allTodos {
      id
      body
      done
    }
  }
`)(AppComponent);

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('react-root')
);
