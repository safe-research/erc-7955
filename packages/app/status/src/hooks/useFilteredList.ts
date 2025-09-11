import { useMemo } from "react";

interface Filter<T> {
  list: readonly T[];
  predicate: (item: T) => boolean;
  max: number;
}

function useFilteredList<T>({ list, predicate, max }: Filter<T>): T[] {
  const filtered = useMemo(() => {
    const result = new Array(max);
    let i = 0;
    for (const item of list) {
      if (predicate(item)) {
        result[i++] = item;
        if (i >= max) {
          break;
        }
      }
    }
    result.length = i;
    return result;
  }, [list, predicate, max]);
  return filtered;
}

export type { Filter };
export { useFilteredList };
