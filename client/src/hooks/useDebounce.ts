import { useEffect,  useState } from "react";

export function useDebounce(value: string, delay = 300) {
    const [debounceValue, setDebouncedValue] = useState(value)

    useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(id);
  }, [value, delay]);

  return debounceValue;
}