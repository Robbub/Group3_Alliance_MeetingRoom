import { useMemo, useState } from "react";

export const Memo = () => {
  const [number, setNumber] = useState<number>(0);
  const [dark, setDark] = useState<boolean>(false);

  //   const doubleNumber = useMemo(() => {
  //     return slowFunction(number);
  //   }, [number]);D

  const doubleNumber = slowFunction(number);

  const theme: React.CSSProperties = {
    backgroundColor: dark ? "black" : "white",
    color: dark ? "white" : "black"
  };

  return (
    <div style={theme}>
      <input
        type="number"
        value={number}
        onChange={(data) => setNumber(parseInt(data.target.value) || 0)}
      />
      <button onClick={() => setDark(!dark)}>
        {dark ? "Set to light mode" : "Set to dark mode"}
      </button>
      <div style={theme}>{doubleNumber}</div>
    </div>
  );
};

const slowFunction = (num: number) => {
  console.log("Calling Slow Function...");
  for (let i = 0; i <= 1000000000; i++) {}
  return num * 2;
};
