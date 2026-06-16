import { useEffect, useRef } from "react";

export default function useSafePolling(callback, delay) {
    const abortRef = useRef(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;

        async function tick() {
            if (!mountedRef.current) return;

            // Cancel any previous request before starting a new one
            if (abortRef.current) abortRef.current.abort();

            const controller = new AbortController();
            abortRef.current = controller;

            try {
                await callback(controller.signal);
            } catch (e) {
                if (e.name !== "AbortError") {
                    console.error("Polling error:", e.message);
                }
            }

            if (mountedRef.current) {
                setTimeout(tick, delay);
            }
        }

        tick(); // start polling loop

        // Cleanup
        return () => {
            mountedRef.current = false;
            if (abortRef.current) abortRef.current.abort();
        };
    }, [callback, delay]);
}
