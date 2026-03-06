import React from 'react';
import { CellData } from '../../store/useGameStore';

interface LetterCellProps {
    cell: CellData;
    onClick: (cell: CellData) => void;
}

export const LetterCell: React.FC<LetterCellProps> = ({ cell, onClick }) => {
    const isRed = cell.owner === 'red';
    const isBlue = cell.owner === 'blue';
    const isEmpty = cell.owner === null;

    let innerBg = "bg-white text-[var(--color-neo-pink)]";
    if (isRed) innerBg = "bg-[var(--color-neo-red)] text-white";
    if (isBlue) innerBg = "bg-[var(--color-neo-blue)] text-white";

    return (
        <button
            onClick={() => onClick(cell)}
            className="group absolute inset-0 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 font-black focus:outline-none drop-shadow-md z-10"
            style={{ fontSize: 'calc(var(--w) * 0.35)' }}
            title={cell.letter}
        >
            <div
                className="absolute inset-0 bg-black flex items-center justify-center pointer-events-none transform-gpu"
                style={{ clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" }}
            >
                <div
                    className={`absolute inset-0 flex items-center justify-center transition-colors ${innerBg}`}
                    style={{
                        clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                        transform: 'scale(0.88)'
                    }}
                >
                    <span className="relative z-10 translate-y-[2%]">{cell.letter}</span>
                </div>
            </div>
        </button>
    );
};
