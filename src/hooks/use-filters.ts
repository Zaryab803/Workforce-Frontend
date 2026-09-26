"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
export function useFilters() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    router.replace(pathname + "?" + next.toString(), { scroll: false });
  };
  return {
    params,
    query: params.toString(),
    set,
    clear: () => router.replace(pathname, { scroll: false }),
  };
}
export function useDebouncedSearch(
  value: string,
  onChange: (v: string) => void,
) {
  const [text, setText] = useState(value);
  const callback = useRef(onChange);
  callback.current = onChange;
  useEffect(() => setText(value), [value]);
  useEffect(() => {
    if (text === value) return;
    const timer = setTimeout(() => callback.current(text), 300);
    return () => clearTimeout(timer);
  }, [text, value]);
  return [text, setText] as const;
}
