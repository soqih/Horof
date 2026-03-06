import { useEffect, useRef, useState } from 'react';

// To bypass mobile browser limitations, audio should be initialized early.
// Please place a 'ring.wav' file in the /public directory.
export const useAudio = (src: string = '/ring.wav', cooldownMs: number = 1000) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isOnCooldown, setIsOnCooldown] = useState(false);

    useEffect(() => {
        // We create the Audio instance on mount
        const audio = new Audio(src);
        audio.preload = 'auto'; // Preload the audio to avoid delay
        audioRef.current = audio;

        return () => {
            audioRef.current = null;
        };
    }, [src]);

    const play = () => {
        if (isOnCooldown || !audioRef.current) return;

        // Resetting and playing instantly for max responsiveness
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) => {
            console.warn('Audio play failed, likely due to mobile interaction rules:', err);
        });

        setIsOnCooldown(true);
        setTimeout(() => {
            setIsOnCooldown(false);
        }, cooldownMs);
    };

    return { play, isOnCooldown };
};
