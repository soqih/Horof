import React from 'react';
import { useGameStore, CellData } from '../../store/useGameStore';
import { LetterCell } from './LetterCell';

interface BoardGridProps {
    onCellClick: (cell: CellData) => void;
}

const BOARD_SIZE = 5;

export const BoardGrid: React.FC<BoardGridProps> = ({ onCellClick }) => {
    const { cells, _hasHydrated } = useGameStore();

    if (!_hasHydrated) return null;

    // Build the 9 columns for the 5x5 Rhombus diamond
    // col = y - x + 4 -> ranges from 0 to 8
    const columns: { cell: CellData, x: number, y: number }[][] = Array.from({ length: 9 }, () => []);

    for (let x = 0; x < BOARD_SIZE; x++) {
        for (let y = 0; y < BOARD_SIZE; y++) {
            const col = y - x + 4;
            const index = x * BOARD_SIZE + y;
            if (cells[index]) {
                columns[col].push({ cell: cells[index], x, y });
            }
        }
    }

    // Sort each column vertically by x + y (smaller means higher up onscreen)
    columns.forEach(col => col.sort((a, b) => (a.x + a.y) - (b.x + b.y)));

    return (
        <div className="relative w-full h-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-0 py-2 sm:py-4">

            <div className="relative w-full z-10 flex flex-col items-center justify-center py-10 px-4 sm:py-16 sm:px-8 lg:py-24 lg:px-12 border-8 border-black shadow-neo-lg overflow-hidden"
                style={{
                    // Perfect cross mapping: Top-Left=Red, Bottom-Left=Blue, Bottom-Right=Red, Top-Right=Blue
                    // 0deg = Up. 0-90 = TR, 90-180 = BR, 180-270 = BL, 270-360 = TL
                    background: 'conic-gradient(from 0deg at 50% 50%, var(--color-neo-blue) 0 90deg, var(--color-neo-red) 90deg 180deg, var(--color-neo-blue) 180deg 270deg, var(--color-neo-red) 270deg 360deg)'
                }}
            >
                {/* Visual shadow / texture matching the image */}
                <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>

                <div className="relative z-10 flex flex-row items-center justify-center w-full"
                    style={{
                        '--w': 'clamp(45px, 9vw, 95px)',
                        '--h': 'calc(var(--w) * 0.866)', // sin(60)
                    } as React.CSSProperties}
                >
                    {columns.map((colGroup, cIdx) => (
                        <div
                            key={cIdx}
                            className="flex flex-col justify-center items-center z-10"
                            style={{
                                // RTL logic: next column renders to the left, so negative margin-right pulls it rightward over the previous column.
                                marginRight: cIdx === 0 ? '0' : 'calc(var(--w) * -0.25)'
                            }}
                        >
                            {colGroup.map(({ cell }) => (
                                <div key={cell.id} className="relative" style={{ width: 'var(--w)', height: 'var(--h)' }}>
                                    <LetterCell cell={cell} onClick={onCellClick} />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
