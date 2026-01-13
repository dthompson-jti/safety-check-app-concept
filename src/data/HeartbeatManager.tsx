import { useEffect, useRef } from 'react';
import { useSetAtom } from 'jotai';
import { fastTickerAtom, throttledTickerAtom, slowTickerAtom } from './atoms';

// 24fps = approx 41.6ms
const CINEMATIC_FRAME_MS = 41;

export function HeartbeatManager() {
    const setFastTicker = useSetAtom(fastTickerAtom);
    const setThrottledTicker = useSetAtom(throttledTickerAtom);
    const setSlowTicker = useSetAtom(slowTickerAtom);

    const requestRef = useRef<number | null>(null);
    const lastSlowTickRef = useRef<number>(Date.now());
    const lastThrottledTickRef = useRef<number>(Date.now());
    const lastFastTickRef = useRef<number>(0);

    useEffect(() => {
        const animate = () => {
            const now = Date.now();

            // 1. 24fps Ticker (Cinematic / Animations)
            if (now - lastFastTickRef.current >= CINEMATIC_FRAME_MS) {
                setFastTicker(now);
                lastFastTickRef.current = now;
            }

            // 2. 10fps Ticker (Text Timers - Fixes React Thrashing)
            if (now - lastThrottledTickRef.current >= 100) {
                setThrottledTicker(now);
                lastThrottledTickRef.current = now;
            }

            // 3. 1fps Ticker (Business Logic)
            if (now - lastSlowTickRef.current >= 1000) {
                setSlowTicker(now);
                lastSlowTickRef.current = now;
            }

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [setFastTicker, setSlowTicker, setThrottledTicker]);

    return null; // Headless component
}
