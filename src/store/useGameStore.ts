import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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
    _hasHydrated: boolean; // Hydration fix

    // Actions
    setHasHydrated: (state: boolean) => void;
    captureCell: (id: number, team: Team) => void;
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

const createInitialCells = (): CellData[] => {
    return LETTERS.map((letter, index) => ({
        id: index,
        letter,
        owner: null,
    }));
};

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            cells: createInitialCells(),
            turn: 'red',
            redPerks: { ...initialPerks },
            bluePerks: { ...initialPerks },
            winner: null,
            activeFazaaTeam: null,
            usedQuestionIds: [],
            _hasHydrated: false,

            setHasHydrated: (state) => {
                set({ _hasHydrated: state });
            },

            captureCell: (id, team) => {
                set((state) => {
                    if (state.winner) return state; // Do nothing if game is over

                    const nextCells = [...state.cells];
                    const cellIndex = nextCells.findIndex((c) => c.id === id);
                    if (cellIndex !== -1 && nextCells[cellIndex].owner === null) {
                        nextCells[cellIndex] = { ...nextCells[cellIndex], owner: team };
                    }

                    const winner = checkWin(nextCells);

                    return {
                        cells: nextCells,
                        turn: team === 'red' ? 'blue' : 'red',
                        winner,
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
                try { localStorage.removeItem('huroof-sub-storage'); } catch { }
                set({
                    cells: createInitialCells(),
                    turn: 'red',
                    redPerks: { ...initialPerks },
                    bluePerks: { ...initialPerks },
                    winner: null,
                    activeFazaaTeam: null,
                    usedQuestionIds: [],
                });
            },

            setTurn: (team) => set({ turn: team }),
            setActiveFazaaTeam: (team) => set({ activeFazaaTeam: team }),
            clearActiveFazaaTeam: () => set({ activeFazaaTeam: null }),
            markQuestionUsed: (id) => set((state) => ({
                usedQuestionIds: [...state.usedQuestionIds, id],
            })),
        }),
        {
            name: 'huroof-sub-storage',
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
