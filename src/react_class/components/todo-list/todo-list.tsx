import { useState } from "react";

import { TodoListHeader } from "./header";
import { TodoListItems } from "./items";

import "./todo-list.css";

export interface TodoListInterface {
  id: number;
  isDone: boolean;
  taskName: string;
  isRemoved: boolean;
}

export const TodoList = () => {
  // LIST HOLDER STATE
  const [todoList, setTodoList] = useState<TodoListInterface[]>([]);

  return (
    <div className="todo-list-container">
      <TodoListHeader setTodoList={setTodoList} todoList={todoList} />
      <TodoListItems todoList={todoList} setTodoList={setTodoList} />
    </div>
  );
};
