import { CellData, Team } from '../store/useGameStore';

const BOARD_SIZE = 5;

// Valid neighbors for a flat-topped hexagon (x, y) isometric grid
const getNeighbors = (x: number, y: number) => {
    const neighbors = [
        { x: x + 1, y }, // Right (Down-Right)
        { x: x - 1, y }, // Left (Up-Left)
        { x, y: y + 1 }, // Down-Left
        { x, y: y - 1 }, // Up-Right
        { x: x + 1, y: y + 1 }, // Straight Down
        { x: x - 1, y: y - 1 }  // Straight Up
    ];
    return neighbors.filter(n => n.x >= 0 && n.x < BOARD_SIZE && n.y >= 0 && n.y < BOARD_SIZE);
};

export const checkWin = (cells: CellData[]): Team | null => {
    // Red wins: connect Top-Left edge (x=0) to Bottom-Right edge (x=4)
    const isRedWin = checkConnection(cells, 'red',
        (x) => x === 0,
        (x) => x === BOARD_SIZE - 1
    );
    if (isRedWin) return 'red';

    // Blue wins: connect Top-Right edge (y=0) to Bottom-Left edge (y=4)
    const isBlueWin = checkConnection(cells, 'blue',
        (x, y) => y === 0,
        (x, y) => y === BOARD_SIZE - 1
    );
    if (isBlueWin) return 'blue';

    return null;
};

const checkConnection = (
    cells: CellData[],
    team: Team,
    isStartNode: (x: number, y: number) => boolean,
    isEndNode: (x: number, y: number) => boolean
): boolean => {
    const startNodes = cells
        .map((cell, idx) => ({ cell, x: Math.floor(idx / BOARD_SIZE), y: idx % BOARD_SIZE }))
        .filter(n => n.cell.owner === team && isStartNode(n.x, n.y));

    for (const start of startNodes) {
        const visited = new Set<number>();
        const stack = [start.x * BOARD_SIZE + start.y];

        while (stack.length > 0) {
            const currentIdx = stack.pop()!;

            if (visited.has(currentIdx)) continue;
            visited.add(currentIdx);

            const cx = Math.floor(currentIdx / BOARD_SIZE);
            const cy = currentIdx % BOARD_SIZE;

            if (isEndNode(cx, cy)) {
                return true;
            }

            const neighborCoords = getNeighbors(cx, cy);

            for (const n of neighborCoords) {
                const idx = n.x * BOARD_SIZE + n.y;
                if (cells[idx] && cells[idx].owner === team && !visited.has(idx)) {
                    stack.push(idx);
                }
            }
        }
    }

    return false;
};
