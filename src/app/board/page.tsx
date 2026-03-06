'use client';

import React, { useState, useCallback } from 'react';
import { useGameStore, CellData, Team } from '../../store/useGameStore';
import type { PerksState } from '../../store/useGameStore';
import { BoardGrid } from '../../components/board/BoardGrid';
import { PerksDashboard, PERK_NAMES } from '../../components/board/PerksDashboard';
import { PerkOverlay } from '../../components/board/PerkOverlay';
import { QuestionModal } from '../../components/board/QuestionModal';
import { NeoButton } from '../../components/ui/NeoButton';
import { NeoModal } from '../../components/ui/NeoModal';

export default function BoardPage() {
    const { winner, turn, setTurn, resetGame, _hasHydrated, setActiveFazaaTeam, clearActiveFazaaTeam } = useGameStore();
    const [activeCell, setActiveCell] = useState<CellData | null>(null);
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
    const [perkOverlay, setPerkOverlay] = useState<{
        perk: keyof PerksState;
        team: Team;
    } | null>(null);

    const handlePerkClick = useCallback((team: Team, perk: keyof PerksState) => {
        setPerkOverlay({ perk, team });
        if (perk === 'fazaa') {
            setActiveFazaaTeam(team);
        }
    }, [setActiveFazaaTeam]);

    const clearPerkOverlay = useCallback(() => setPerkOverlay(null), []);

    if (!_hasHydrated) return null;

    const handleCellClick = (cell: CellData) => {
        if (cell.owner === null && !winner) {
            setActiveCell(cell);
        }
    };

    const confirmReset = () => {
        resetGame();
        setIsResetConfirmOpen(false);
    };

    return (
        <div className="h-screen w-screen overflow-hidden bg-[var(--color-neo-bg)] p-2 sm:p-4 flex flex-col gap-2 sm:gap-6">

            {/* Header & Global Controls */}
            <header className="flex flex-row items-center justify-between border-8 border-black p-4 bg-white shadow-neo-lg gap-4">

                <h1 className="text-3xl sm:text-4xl font-black uppercase text-black drop-shadow-[2px_2px_0px_var(--color-neo-blue)]">
                    حروف صب
                </h1>

                <NeoButton variant="primary" size="md" onClick={() => setIsResetConfirmOpen(true)}>
                    لعبة جديدة
                </NeoButton>

            </header>

            {/* Main Board Content - Flex remaining height */}
            <div className="flex-1 flex flex-col lg:flex-row items-start justify-center gap-4 lg:gap-6 overflow-hidden min-h-0 w-full">

                {/* Red Perks */}
                <div className="w-full lg:w-1/5 flex-shrink-0 lg:flex-shrink overflow-y-auto">
                    <PerksDashboard team="red" onPerkClick={handlePerkClick} />
                </div>

                {/* The Grid (Takes maximum space) */}
                <div className="w-full flex-1 h-full flex items-center justify-center min-h-0">
                    <BoardGrid onCellClick={handleCellClick} />
                </div>

                {/* Blue Perks */}
                <div className="w-full lg:w-1/5 flex-shrink-0 lg:flex-shrink overflow-y-auto">
                    <PerksDashboard team="blue" onPerkClick={handlePerkClick} />
                </div>

            </div>

            {/* Perk activation overlay */}
            <PerkOverlay
                perkName={perkOverlay ? PERK_NAMES[perkOverlay.perk] : ''}
                team={perkOverlay?.team ?? 'red'}
                isVisible={!!perkOverlay}
                onComplete={clearPerkOverlay}
            />

            {/* Modals */}
            <QuestionModal
                isOpen={!!activeCell}
                cell={activeCell}
                onClose={() => {
                    clearActiveFazaaTeam();
                    setActiveCell(null);
                }}
            />

            {/* Reset Confirmation */}
            <NeoModal
                isOpen={isResetConfirmOpen}
                onClose={() => setIsResetConfirmOpen(false)}
                title="تأكيد لعبة جديدة"
                footer={
                    <div className="flex justify-end gap-4 mt-4">
                        <NeoButton variant="red" onClick={confirmReset}>نعم، ابدأ اللعبة</NeoButton>
                        <NeoButton variant="gray" onClick={() => setIsResetConfirmOpen(false)} className="!bg-white">إلغاء</NeoButton>
                    </div>
                }
            >
                <p className="text-center font-bold">
                    هل أنت متأكد من بدء لعبة جديدة؟ سيلغي هذا جميع التقدم الحالي.
                </p>
            </NeoModal>

            {/* Victory Modal */}
            <NeoModal
                isOpen={!!winner}
                title="انتهت اللعبة!"
                footer={
                    <div className="flex justify-center mt-4">
                        <NeoButton variant="primary" size="lg" onClick={confirmReset}>لعبة جديدة</NeoButton>
                    </div>
                }
            >
                <div className="text-center flex flex-col items-center gap-6 py-8">
                    <div className={`text-6xl font-black border-8 border-black p-8 shadow-neo-lg animate-bounce ${winner === 'red' ? 'bg-[var(--color-neo-red)] text-white' : 'bg-[var(--color-neo-blue)] text-white'}`}>
                        {winner === 'red' ? 'الفريق الأحمر فاز!' : 'الفريق الأزرق فاز!'}
                    </div>
                    <p className="text-2xl mt-4">
                        {winner === 'red' ? 'اكتمل المسار من الأعلى إلى الأسفل' : 'اكتمل المسار من اليمين إلى اليسار'}
                    </p>
                </div>
            </NeoModal>

        </div>
    );
}
