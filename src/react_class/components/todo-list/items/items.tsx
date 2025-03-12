import { TodoListInterface } from "../todo-list";

interface ItemsInterface {
  todoList: TodoListInterface[];
  setTodoList: (data: TodoListInterface[]) => void;
}

export const TodoListItems = ({ todoList, setTodoList }: ItemsInterface) => {

  // ON CLICK MARK AS DONE
  const onClickMarkAsDone = (data: TodoListInterface) => {
    // FIND INDEX
    let index = todoList.findIndex(
      (todo: TodoListInterface) => todo.id === data.id
    );
    // CLONE THE TODO LIST STATE
    let todoListUpdate = [...todoList];
    if (index !== -1) todoListUpdate[index] = { ...data, isDone: true };

    // SET THE UPDATED TODO LIST
    setTodoList(todoListUpdate);
  };

  // ON CLICK REACTIVATE
  const onClickReactivate = (data: TodoListInterface) => {
    // FIND INDEX
    let index = todoList.findIndex(
      (todo: TodoListInterface) => todo.id === data.id
    );
    // CLONE THE TODO LIST STATE
    let todoListUpdate = [...todoList];
    if (index !== -1) todoListUpdate[index] = { ...data, isDone: false };

    // SET THE UPDATED TODO LIST
    setTodoList(todoListUpdate);
  };

  // ON CLICK REMOVE
  const onClickRemove = (data: TodoListInterface) => {
    // FIND INDEX
    let index = todoList.findIndex(
      (todo: TodoListInterface) => todo.id === data.id
    );
    // CLONE THE TODO LIST STATE
    let todoListUpdate = [...todoList];
    if (index !== -1) todoListUpdate[index] = { ...data, isRemoved: true };

    // SET THE UPDATED TODO LIST
    setTodoList(todoListUpdate);
  };

  return (
    <div className="list-container-style">
      {todoList.map((data: TodoListInterface, key: number) => {
        if (!data.isRemoved)
          return (
            <div
              key={key}
              className={
                data.isDone ? "list-item-style done" : "list-item-style"
              }
            >
              <h1>{data.taskName}</h1>
              <div style={{ display: "flex", gap: "2px" }}>
                {data.isDone ? (
                  <button
                    className="mark-done-button-style"
                    onClick={() => onClickReactivate(data)}
                  >
                    Reactivate
                  </button>
                ) : (
                  <button
                    className="mark-done-button-style"
                    onClick={() => onClickMarkAsDone(data)}
                  >
                    Mark as on hold
                  </button>
                )}
                <button
                  className="remove-button-style"
                  onClick={() => onClickRemove(data)}
                >
                  Remove
                </button>
              </div>
            </div>
          );
      })}
    </div>
  );
};
