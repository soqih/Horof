'use client';

import React, { useEffect } from 'react';
import { Team } from '../../store/useGameStore';

interface PerkOverlayProps {
    perkName: string;
    team: Team;
    isVisible: boolean;
    onComplete: () => void;
}

export const PerkOverlay: React.FC<PerkOverlayProps> = ({
    perkName,
    team,
    isVisible,
    onComplete,
}) => {
    useEffect(() => {
        if (!isVisible) return;
        const timer = setTimeout(onComplete, 1000);
        return () => clearTimeout(timer);
    }, [isVisible, onComplete]);

    if (!isVisible) return null;

    const isRed = team === 'red';

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            aria-live="polite"
            aria-label={`Perk activated: ${perkName}`}
        >
            <div
                className={`text-5xl sm:text-7xl lg:text-8xl font-black border-8 border-black px-12 py-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-white select-none animate-[perk-buzz_1s_ease-in-out] ${
                    isRed ? 'bg-[var(--color-neo-red)]' : 'bg-[var(--color-neo-blue)]'
                }`}
            >
                {perkName}
            </div>
        </div>
    );
};
