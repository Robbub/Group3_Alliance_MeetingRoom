import { Fragment, useState } from "react";

import { TodoListInterface } from "../todo-list";

import "../todo-list.css";

interface HeaderInterface {
  setTodoList: (data: TodoListInterface[]) => void;
  todoList: TodoListInterface[];
}

export const TodoListHeader = ({ setTodoList, todoList }: HeaderInterface) => {
  const [inputValue, setinputtedValue] = useState<string>("");

  const onChangeInputValue = (data: string) => {
    setinputtedValue(data);
  };

  const onClickAddButton = () => {
    if (inputValue) {
      let todo: TodoListInterface = {
        id: Math.random(),
        taskName: inputValue,
        isDone: false,
        isRemoved: false
      };
      setTodoList([...todoList, todo]);
      setinputtedValue("");
    }
  };

  return (
    <Fragment>
      {/* HEADER COMPONENT */}
      <div className="header-container-style">
        <label style={{ fontWeight: "bold", fontSize: "20px" }}>
          My To-do List App
        </label>
        <div style={{ display: "flex", gap: "2px" }}>
          <input
            type="text"
            className="input-field-style"
            value={inputValue}
            onChange={(data) => onChangeInputValue(data.target.value)}
          />
          <button className="add-button-style" onClick={onClickAddButton}>
            Add To-Do
          </button>
        </div>
      </div>
    </Fragment>
  );
};
