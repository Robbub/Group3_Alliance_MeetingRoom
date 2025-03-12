import { useState } from "react";

export const IncrementingButton = () => {

  // SET NUMBER STATE
  const [number, setNumber] = useState<number>(0);

  return (
    <div>
      <p>Curent Number: {number}</p>
      <div style={{ display: "flex", gap:5 }}>
        <button onClick={() => setNumber(number + 1)}>
          Click to increment
        </button>
        <button onClick={() => setNumber(number - 1)}>
          Click to decrement
        </button>
      </div>
    </div>
  );
};

export const InputFieldState = () => {
  const [text, setText] = useState<string>("");

  return (
    <div>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something..."
      />
      <p>You typed: {text}</p>
    </div>
  );
};
