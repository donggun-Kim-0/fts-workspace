'use client';

import { useEffect, useState } from 'react';

/** 값 변경 후 delay(ms) 뒤에 반영되는 debounced 값 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
