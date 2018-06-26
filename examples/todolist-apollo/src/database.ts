export interface TodoSource {
  body: string;
  done: boolean;
}

const items: Array<TodoSource | undefined> = [
  { body: 'Hello, Girin', done: false },
]

export const TodoDatabase = {
  findAll() {
    return items
      .map((item, id)=> (item && ({ id, ...item })))
      .filter(item => item !== undefined);
  },
  insert(body: string) {
    const item = { body, done: false };
    items.push(item);
    return { id: items.indexOf(item), ...item };
  },
  delete(id: number) {
    const found = items[id];
    if (!found) { throw new Error('Todo item not found'); }
    delete items[id];
    return id;
  },
  toggle(id: number) {
    const found = items[id];
    if (!found) { throw new Error('Todo item not found'); }
    found.done = !found.done;
    return { id, ...found };
  }
};
