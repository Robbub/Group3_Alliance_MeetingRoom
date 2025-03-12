import React, { useEffect, useState } from "react";

export const MultiplyBy2Button = () => {
  // SET NUMBER 1 STATE
  const [number1, setNumber1] = useState<number>(0);

  // SET NUMBER 2 STATE
  const [number2, setNumber2] = useState<number>(0);

  useEffect(() => {
    setNumber2(number1 * 2);
  }, [number1]);

  return (
    <div>
      <p>Curent Number: {number1}</p>
      <p>Number multiplied by 2: {number2}</p>
      <div style={{ display: "flex", gap: 5 }}>
        <button onClick={() => setNumber1(number1 + 1)}>
          Click to increment
        </button>
        <button onClick={() => setNumber1(number1 - 1)}>
          Click to decrement
        </button>
      </div>
    </div>
  );
};

export const CountCharsFieldState = () => {
  const [text, setText] = useState<string>("");

  const [charCount, setCharCount] = useState<number>(0);

  useEffect(() => {
    setCharCount(text.length);
  }, [text]);

  return (
    <div>
      <p>You inputted: {text}</p>
      <p>Total character inputted {charCount}</p>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something..."
      />
    </div>
  );
};
