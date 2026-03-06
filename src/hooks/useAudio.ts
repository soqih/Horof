import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Mobile-friendly audio hook using AudioContext.
 * On mobile browsers, `new Audio().play()` is blocked unless called from
 * a direct user-gesture handler. AudioContext can be resumed in a gesture
 * handler, then any buffers can play freely.
 */
export const useAudio = (src: string = '/ring.wav', cooldownMs: number = 1000) => {
    const ctxRef = useRef<AudioContext | null>(null);
    const bufferRef = useRef<AudioBuffer | null>(null);
    const [isOnCooldown, setIsOnCooldown] = useState(false);
    const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;

        const ctx = new AudioCtx();
        ctxRef.current = ctx;

        // Fetch and decode the audio file
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
        fetch(`${basePath}${src}`)
            .then((res) => res.arrayBuffer())
            .then((data) => ctx.decodeAudioData(data))
            .then((decoded) => {
                bufferRef.current = decoded;
            })
            .catch((err) => {
                console.warn('Audio decode failed:', err);
            });

        return () => {
            if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
            ctx.close().catch(() => { });
            ctxRef.current = null;
            bufferRef.current = null;
        };
    }, [src]);

    const play = useCallback(() => {
        if (isOnCooldown) return;

        const ctx = ctxRef.current;
        const buffer = bufferRef.current;
        if (!ctx || !buffer) return;

        // Resume AudioContext on user gesture (required by mobile browsers)
        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => { });
        }

        // Play the decoded buffer
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);

        setIsOnCooldown(true);
        cooldownTimerRef.current = setTimeout(() => {
            setIsOnCooldown(false);
        }, cooldownMs);
    }, [isOnCooldown, cooldownMs]);

    return { play, isOnCooldown };
};
