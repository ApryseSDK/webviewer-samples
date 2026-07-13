import { useEffect, useRef, useState } from "react";

/**
 * useState that persists to localStorage. JSON-encodes the value.
 * If parsing fails or no value is stored, returns the default.
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
    const [value, setValue] = useState<T>(() => {
        try {
            const stored = window.localStorage.getItem(key);
            if (stored === null) {
                return defaultValue;
            }
            return JSON.parse(stored) as T;
        } catch (e) {
            console.warn(`[useLocalStorage] Failed to read key "${key}":`, e);
            return defaultValue;
        }
    });

    // Keep a ref to the value to avoid re-running the effect on every change
    const valueRef = useRef(value);
    valueRef.current = value;

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(valueRef.current));
        } catch (e) {
            console.warn(`[useLocalStorage] Failed to write key "${key}":`, e);
        }
    }, [key, value]);

    return [value, setValue];
}
