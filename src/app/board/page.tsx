'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { checkWin } from '../../lib/pathfinding';
import { useGameStore, CellData, Team } from '../../store/useGameStore';
import { BoardGrid } from '../../components/board/BoardGrid';
import { NeoButton } from '../../components/ui/NeoButton';
import { NeoModal } from '../../components/ui/NeoModal';

const WIN_CONFIRM_SECONDS = 10;

export default function BoardPage() {
    const {
        cells,
        winner,
        setWinner,
        resetGame,
        _hasHydrated,
        cycleCellOwner,
    } = useGameStore();
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
    const [pendingWinner, setPendingWinner] = useState<Team | null>(null);
    const [pendingSeconds, setPendingSeconds] = useState(WIN_CONFIRM_SECONDS);
    const winTimeoutRef = useRef<number | null>(null);
    const winIntervalRef = useRef<number | null>(null);

    const clearPendingWinTimers = useCallback(() => {
        if (winTimeoutRef.current !== null) {
            window.clearTimeout(winTimeoutRef.current);
            winTimeoutRef.current = null;
        }
        if (winIntervalRef.current !== null) {
            window.clearInterval(winIntervalRef.current);
            winIntervalRef.current = null;
        }
    }, []);

    const clearPendingWin = useCallback(() => {
        clearPendingWinTimers();
        setPendingWinner(null);
        setPendingSeconds(WIN_CONFIRM_SECONDS);
    }, [clearPendingWinTimers]);

    const startPendingWin = useCallback(
        (team: Team) => {
            clearPendingWinTimers();

            setPendingWinner(team);
            setPendingSeconds(WIN_CONFIRM_SECONDS);

            let remaining = WIN_CONFIRM_SECONDS;
            winIntervalRef.current = window.setInterval(() => {
                remaining -= 1;
                if (remaining > 0) {
                    setPendingSeconds(remaining);
                }
            }, 1000);

            winTimeoutRef.current = window.setTimeout(() => {
                const state = useGameStore.getState();
                const stableWinner = checkWin(state.cells);
                if (!state.winner && stableWinner === team) {
                    state.setWinner(team);
                }
                clearPendingWin();
            }, WIN_CONFIRM_SECONDS * 1000);
        },
        [clearPendingWin, clearPendingWinTimers]
    );

    const evaluatePendingWin = useCallback(() => {
        const state = useGameStore.getState();
        if (state.winner) {
            clearPendingWin();
            return;
        }

        const detectedWinner = checkWin(state.cells);
        if (!detectedWinner) {
            clearPendingWin();
            return;
        }

        // Restart the countdown after every board change.
        startPendingWin(detectedWinner);
    }, [clearPendingWin, startPendingWin]);

    const handleCellClick = (cell: CellData) => {
        if (winner) return;
        const before = cells.map((c) => c.owner ?? '-').join('|');
        cycleCellOwner(cell.id);
        const after = useGameStore.getState().cells.map((c) => c.owner ?? '-').join('|');
        if (before !== after) {
            evaluatePendingWin();
        }
    };

    const confirmReset = () => {
        clearPendingWin();
        setWinner(null);
        resetGame();
        setIsResetConfirmOpen(false);
    };

    useEffect(() => () => {
        clearPendingWinTimers();
    }, [clearPendingWinTimers]);

    if (!_hasHydrated) return null;

    return (
        <div className="relative h-screen w-screen overflow-hidden bg-[var(--color-neo-bg)]">
            <div className="absolute top-3 left-3 z-30">
                <NeoButton variant="primary" onClick={() => setIsResetConfirmOpen(true)}>
                    لعبة جديدة
                </NeoButton>
            </div>

            {pendingWinner && !winner && (
                <div
                    className={`absolute top-3 right-3 z-30 border-4 border-black px-4 py-2 font-black text-lg shadow-neo ${pendingWinner === 'red'
                            ? 'bg-[var(--color-neo-red)] text-white'
                            : 'bg-[var(--color-neo-blue)] text-white'
                        }`}
                >
                    {pendingWinner === 'red' ? 'فوز الأحمر خلال' : 'فوز الأزرق خلال'} {pendingSeconds}
                </div>
            )}

            <div className="h-full w-full p-1 sm:p-2">
                <BoardGrid onCellClick={handleCellClick} />
            </div>

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
                        {winner === 'red' ? 'اكتمل مسار الأحمر' : 'اكتمل مسار الأزرق'}
                    </p>
                </div>
            </NeoModal>
        </div>
    );
}
