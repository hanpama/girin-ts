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
