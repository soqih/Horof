import React from 'react';
import { useGameStore, Team, PerksState } from '../../store/useGameStore';
import { NeoButton } from '../ui/NeoButton';

interface PerksDashboardProps {
    team: Team;
    onPerkClick?: (team: Team, perk: keyof PerksState) => void;
}

export const PERK_NAMES: Record<keyof PerksState, string> = {
    fazaa: 'فزعة صب',
    oss: 'اوص',
    rahBas: 'رح بس'
};

export const PerksDashboard: React.FC<PerksDashboardProps> = ({ team, onPerkClick }) => {
    const { redPerks, bluePerks, usePerk: activatePerk, _hasHydrated } = useGameStore();

    if (!_hasHydrated) return null;

    const perks = team === 'red' ? redPerks : bluePerks;
    const isRed = team === 'red';

    return (
        <div className={`p-2 lg:p-4 border-[6px] lg:border-8 border-black ${isRed ? 'bg-[var(--color-neo-red)]/10' : 'bg-[var(--color-neo-blue)]/10'} shadow-neo w-full flex flex-col gap-2 lg:gap-4`}>
            <h3 className={`text-xl lg:text-2xl font-black ${isRed ? 'text-red-700' : 'text-blue-700'} text-center`}>
                {isRed ? 'الفريق الأحمر' : 'الفريق الأزرق'}
            </h3>

            <div className="flex flex-col gap-2 lg:gap-3">
                {Object.entries(perks).map(([key, isUsed]) => {
                    const perkKey = key as keyof PerksState;

                    return (
                        <NeoButton
                            key={perkKey}
                            variant={isUsed ? 'gray' : (isRed ? 'red' : 'blue')}
                            size="sm"
                            disabled={isUsed}
                            onClick={() => {
                                onPerkClick?.(team, perkKey);
                                activatePerk(team, perkKey);
                            }}
                            className={isUsed ? 'line-through text-gray-500 bg-gray-300' : ''}
                        >
                            {PERK_NAMES[perkKey]}
                        </NeoButton>
                    );
                })}
            </div>
        </div>
    );
};
