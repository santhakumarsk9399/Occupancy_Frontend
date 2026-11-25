import { useEffect, useRef } from 'react';

// useInactivityAutoAdvance: cycles through items after inactivityMs of no pointer/keyboard activity
export function useInactivityAutoAdvance({ items, activeIndex, onAdvance, inactivityMs = 10000 }) {
  const timerRef = useRef();

  useEffect(() => {
    const reset = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (!items?.length) return;
        const next = (activeIndex + 1) % items.length;
        onAdvance(next);
      }, inactivityMs);
    };
    reset();
    const events = ['mousemove', 'keydown', 'wheel', 'touchstart'];
    events.forEach(ev => window.addEventListener(ev, reset));
    return () => { events.forEach(ev => window.removeEventListener(ev, reset)); if (timerRef.current) clearTimeout(timerRef.current); };
  }, [items, activeIndex, onAdvance, inactivityMs]);
}
