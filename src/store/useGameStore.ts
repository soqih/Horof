import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { checkWin } from '../lib/pathfinding';
import { LETTERS } from '../lib/constants';

export type Team = 'red' | 'blue';

export interface CellData {
    id: number;
    letter: string;
    owner: Team | null;
}

export interface PerksState {
    fazaa: boolean; // فزعة صب
    oss: boolean;   // اوص
    rahBas: boolean; // رح بس
}

interface GameState {
    cells: CellData[];
    turn: Team;
    redPerks: PerksState;
    bluePerks: PerksState;
    winner: Team | null;
    activeFazaaTeam: Team | null; // Which team's فزعة is active THIS turn
    usedQuestionIds: string[]; // Track used questions to prevent repeats
    lastEditedCellId: number | null; // Last editable cell on the board
    _hasHydrated: boolean; // Hydration fix

    // Actions
    setHasHydrated: (state: boolean) => void;
    captureCell: (id: number, team: Team) => void;
    cycleCellOwner: (id: number) => void;
    usePerk: (team: Team, perk: keyof PerksState) => void;
    resetGame: () => void;
    setTurn: (team: Team) => void; // Optional manual override
    setActiveFazaaTeam: (team: Team | null) => void;
    clearActiveFazaaTeam: () => void;
    markQuestionUsed: (id: string) => void;
}

const initialPerks: PerksState = {
    fazaa: false,
    oss: false,
    rahBas: false,
};

const shuffleLetters = (letters: string[]): string[] => {
    const shuffled = [...letters];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
    }
    return shuffled;
};

const createInitialCells = (): CellData[] => {
    const randomizedLetters = shuffleLetters(LETTERS);
    return randomizedLetters.map((letter, index) => ({
        id: index,
        letter,
        owner: null,
    }));
};

export const useGameStore = create<GameState>()(
    persist(
        (set) => ({
            cells: createInitialCells(),
            turn: 'red',
            redPerks: { ...initialPerks },
            bluePerks: { ...initialPerks },
            winner: null,
            activeFazaaTeam: null,
            usedQuestionIds: [],
            lastEditedCellId: null,
            _hasHydrated: false,

            setHasHydrated: (state) => {
                set({ _hasHydrated: state });
            },

            captureCell: (id, team) => {
                set((state) => {
                    if (state.winner) return state; // Do nothing if game is over

                    const nextCells = [...state.cells];
                    const cellIndex = nextCells.findIndex((c) => c.id === id);
                    if (cellIndex === -1) return state;
                    if (nextCells[cellIndex].owner !== null) return state;

                    nextCells[cellIndex] = { ...nextCells[cellIndex], owner: team };

                    const winner = checkWin(nextCells);

                    return {
                        cells: nextCells,
                        turn: team === 'red' ? 'blue' : 'red',
                        winner,
                        lastEditedCellId: id,
                    };
                });
            },

            cycleCellOwner: (id) => {
                set((state) => {
                    if (state.winner) return state;
                    const nextCells = [...state.cells];
                    const cellIndex = nextCells.findIndex((c) => c.id === id);
                    if (cellIndex === -1) return state;

                    const currentOwner = nextCells[cellIndex].owner;
                    const isEditable =
                        currentOwner === null || state.lastEditedCellId === id;

                    // Prevent editing an older colored cell after moving on.
                    if (!isEditable) return state;

                    const nextOwner: Team | null =
                        currentOwner === null
                            ? 'red'
                            : currentOwner === 'red'
                                ? 'blue'
                                : null;

                    nextCells[cellIndex] = { ...nextCells[cellIndex], owner: nextOwner };

                    return {
                        cells: nextCells,
                        winner: checkWin(nextCells),
                        lastEditedCellId: id,
                    };
                });
            },

            usePerk: (team, perk) => {
                set((state) => {
                    if (team === 'red') {
                        return { redPerks: { ...state.redPerks, [perk]: true } };
                    } else {
                        return { bluePerks: { ...state.bluePerks, [perk]: true } };
                    }
                });
            },

            resetGame: () => {
                // Clear persisted storage completely
                try {
                    sessionStorage.removeItem('huroof-sub-storage');
                } catch { }
                set({
                    cells: createInitialCells(),
                    turn: 'red',
                    redPerks: { ...initialPerks },
                    bluePerks: { ...initialPerks },
                    winner: null,
                    activeFazaaTeam: null,
                    usedQuestionIds: [],
                    lastEditedCellId: null,
                });
            },

            setTurn: (team) => set({ turn: team }),
            setActiveFazaaTeam: (team) => set({ activeFazaaTeam: team }),
            clearActiveFazaaTeam: () => set({ activeFazaaTeam: null }),
            markQuestionUsed: (id) =>
                set((state) => {
                    if (state.usedQuestionIds.includes(id)) return state;
                    return { usedQuestionIds: [...state.usedQuestionIds, id] };
                }),
        }),
        {
            name: 'huroof-sub-storage',
            storage: createJSONStorage(() => sessionStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
