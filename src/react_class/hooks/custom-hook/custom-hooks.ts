import { useEffect, useState } from "react";

export const useCounterHook = () => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    setCount(count);
  }, [count]);

  return { count, setCount };
};

export const useCalculator = () => {
  const [result, setResult] = useState<number>(0);

  const onAdd = (num: number) => {
    setResult(num + result);
  };

  const onMultiply = (num: number) => {
    setResult(num * result);
  };

  return { onAdd, onMultiply, result };
};
