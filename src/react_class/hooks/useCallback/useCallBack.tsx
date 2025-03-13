import React, { useCallback, useEffect, useState } from "react";

export const CallBack = () => {
  const [number, setNumber] = useState<number>(1);
  const [dark, setDark] = useState<boolean>(false);

  // const getItems = useCallback(() => {
  //   return [number, number + 1, number + 2];
  // }, [number]);

  const getItems = (): number[] => {
    return [number, number + 1, number + 2];
  };

  const theme: React.CSSProperties = {
    backgroundColor: dark ? "#00000057" : "white",
    color: dark ? "black" : "white"
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
      <List getItems={getItems} />
    </div>
  );
};

const List = ({ getItems }: { getItems: () => number[] }) => {
  const [items, setItems] = useState<number[]>([]);

  useEffect(() => {
    setItems(getItems);
    console.log("Updating Items");
  }, [getItems]);

  return items.map((item) => (
    <div style={{ color: "black" }} key={item}>
      {item.toString()}
    </div>
  ));
};
