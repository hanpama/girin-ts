import * as React from 'react';

import { graphql, compose } from "react-apollo";
import gql from "graphql-tag";


type TodoListUIProps = any;
type TodoListUIState = {
  buffer: string;
}

class TodoListUI extends React.Component<TodoListUIProps, TodoListUIState> {
  constructor(props: TodoListUIProps) {
    super(props);
    this.state = {
      buffer: ''
    };
  }

  toggleItem(id: number) {
    return this.props.toggleItem({ variables: { id } });
  }

  async deleteTodo(id: number) {
    await this.props.deleteItem({ variables: { id } })
    return this.props.data.refetch();
  }

  async createTodoWithBufferContent() {
    const body = this.state.buffer;
    await this.props.createItem({ variables: { body }});
    this.setState({ buffer: '' });
    return this.props.data.refetch();
  }

  render() {
    return (
      <div style={{ maxWidth: '720px', margin: '100px auto' }}>
        <h1>Todos!</h1>
        <ul className="list-group">
        {
          this.props.data.loading
          ? <li className="list-group-item">loading...</li>
          : this.props.data.allTodos.map((todo: any) => (
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
          this.createTodoWithBufferContent();
        }}>
          <input
            className="form-control"
            type="text"
            value={this.state.buffer}
            onChange={e => this.setState({ buffer: e.target.value })}
          />
        </form>
      </div>
    );
  }
}

const queryAllTodos = gql`
query {
  allTodos {
    id
    body
    done
  }
}
`

const toggleItem = gql`
  mutation($id: Int!) {
    toggleTodo(id: $id) { id body done }
  }
`;

const deleteItem = gql`
  mutation($id: Int!) { deleteTodo(id: $id) }
`;

const createItem = gql`
  mutation($body: String!) {
    createTodo(body: $body) { id body done }
  }
`;

export const TodoList: React.ComponentClass = compose(
  graphql(queryAllTodos),
  graphql(toggleItem, { name: 'toggleItem' }),
  graphql(deleteItem, { name: 'deleteItem' }),
  graphql(createItem, { name: 'createItem' }),
)(TodoListUI);
