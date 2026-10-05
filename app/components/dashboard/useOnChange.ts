"use client";

import { useEffect, useRef } from "react";

/**
 * Runs a callback whenever a value changes (skipping the initial mount).
 *
 * The callback runs in an effect rather than during render: consumers use this
 * to react to a successful server action by resetting local state and calling
 * `router.refresh()`. Doing that during render triggers React's
 * "Cannot update a component while rendering a different component" error.
 */
export function useOnChange<T>(value: T, callback: (previous: T | undefined) => void) {
  const previousRef = useRef<{ value: T } | null>(null);
  const callbackRef = useRef(callback);

  // Keep the latest callback without re-running the effect on every render.
  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    const previous = previousRef.current;
    previousRef.current = { value };

    // Ignore the first run so mounting doesn't fire success handlers.
    if (previous === null) return;
    if (Object.is(previous.value, value)) return;

    callbackRef.current(previous.value);
  }, [value]);
}