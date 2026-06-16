import { useState } from "react";

export default function useHistory(initial = []) {
    const [history, setHistory] = useState({
        past: [],
        present: initial,
        future: []
    });

    const set = (newPresent) => {
        setHistory((prev) => ({
            past: [...prev.past, prev.present],
            present: newPresent,
            future: []
        }));
    };

    const undo = () => {
        setHistory((prev) => {
            if (!prev.past.length) return prev;
            const previous = prev.past[prev.past.length - 1];
            return {
                past: prev.past.slice(0, -1),
                present: previous,
                future: [prev.present, ...prev.future]
            };
        });
    };

    const redo = () => {
        setHistory((prev) => {
            if (!prev.future.length) return prev;
            const next = prev.future[0];
            return {
                past: [...prev.past, prev.present],
                present: next,
                future: prev.future.slice(1)
            };
        });
    };

    return {
        state: history.present,
        set,
        undo,
        redo
    };
}