'use client';

import React, { useState } from 'react';
import { useGameStore, CellData } from '../../store/useGameStore';
import { BoardGrid } from '../../components/board/BoardGrid';
import { NeoButton } from '../../components/ui/NeoButton';
import { NeoModal } from '../../components/ui/NeoModal';

export default function BoardPage() {
    const {
        winner,
        resetGame,
        _hasHydrated,
        cycleCellOwner,
    } = useGameStore();
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

    if (!_hasHydrated) return null;

    const handleCellClick = (cell: CellData) => {
        cycleCellOwner(cell.id);
    };

    const confirmReset = () => {
        resetGame();
        setIsResetConfirmOpen(false);
    };

    return (
        <div className="relative h-screen w-screen overflow-hidden bg-[var(--color-neo-bg)]">
            <div className="absolute top-3 left-3 z-30">
                <NeoButton variant="primary" onClick={() => setIsResetConfirmOpen(true)}>
                    لعبة جديدة
                </NeoButton>
            </div>

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
