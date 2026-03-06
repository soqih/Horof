'use client';

import React, { useState } from 'react';
import { useAudio } from '../../hooks/useAudio';

export default function BuzzerPage() {
    const { play, isOnCooldown } = useAudio('/ring.wav', 1000);
    const [isFlashing, setIsFlashing] = useState(false);

    const handleTap = () => {
        if (isOnCooldown) return;

        play();

        // Add visual flash
        setIsFlashing(true);
        setTimeout(() => {
            setIsFlashing(false);
        }, 150);
    };

    return (
        <div
            className={`min-h-screen min-w-full flex items-center justify-center transition-colors duration-75 ${isFlashing ? 'bg-[var(--color-neo-primary)]' : 'bg-[var(--color-neo-bg)]'
                }`}
        >
            <button
                onClick={handleTap}
                disabled={isOnCooldown}
                className={`
          w-[90vw] h-[80vh] rounded-[3rem] border-[16px] border-black text-6xl font-black flex items-center justify-center transition-all duration-75 select-none
          ${isOnCooldown
                        ? 'bg-gray-300 text-gray-500 shadow-none transform translate-y-8 translate-x-8'
                        : 'bg-[var(--color-neo-red)] text-white shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 active:translate-y-8 active:translate-x-8 active:shadow-none'
                    }
        `}
            >
                <span className="transform -rotate-12 inline-block">
                    {isOnCooldown ? 'انتظر...' : 'اضغط!'}
                </span>
            </button>
        </div>
    );
}
