import {
  DIFFICULTY_CLUES,
  SIZE,
  type Board,
  type CellState,
  type Difficulty,
  type Grid,
  type Puzzle,
} from "./types";
import { cloneGrid, emptyGrid, isSafe } from "./validator";

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function fillBoard(grid: Grid): boolean {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (grid[row][col] !== 0) continue;

      for (const num of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
        if (!isSafe(grid, row, col, num)) continue;
        grid[row][col] = num;
        if (fillBoard(grid)) return true;
        grid[row][col] = 0;
      }
      return false;
    }
  }
  return true;
}

function generateCompleteGrid(): Grid {
  const grid = emptyGrid();
  fillBoard(grid);
  return grid;
}

/** Counts solutions up to `limit` (usually 2 for uniqueness checks). */
function countSolutions(grid: Grid, limit = 2): number {
  let count = 0;

  const solve = (): boolean => {
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        if (grid[row][col] !== 0) continue;

        for (let num = 1; num <= SIZE; num++) {
          if (!isSafe(grid, row, col, num)) continue;
          grid[row][col] = num;
          if (solve()) {
            grid[row][col] = 0;
            return true;
          }
          grid[row][col] = 0;
        }
        return false;
      }
    }

    count += 1;
    return count >= limit;
  };

  solve();
  return count;
}

function hasUniqueSolution(grid: Grid): boolean {
  return countSolutions(cloneGrid(grid), 2) === 1;
}

function clueTarget(difficulty: Difficulty): number {
  const { min, max } = DIFFICULTY_CLUES[difficulty];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function carvePuzzle(solution: Grid, difficulty: Difficulty): Grid {
  const puzzle = cloneGrid(solution);
  const targetClues = clueTarget(difficulty);
  const positions = shuffle(
    Array.from({ length: SIZE * SIZE }, (_, i) => ({
      row: Math.floor(i / SIZE),
      col: i % SIZE,
    })),
  );

  let clues = SIZE * SIZE;

  for (const { row, col } of positions) {
    if (clues <= targetClues) break;

    const backup = puzzle[row][col];
    puzzle[row][col] = 0;

    if (hasUniqueSolution(puzzle)) {
      clues -= 1;
    } else {
      puzzle[row][col] = backup;
    }
  }

  return puzzle;
}

function toBoard(puzzle: Grid): Board {
  return puzzle.map((row) =>
    row.map(
      (value): CellState => ({
        value: value === 0 ? null : value,
        notes: [],
        given: value !== 0,
      }),
    ),
  );
}

export function createPuzzle(difficulty: Difficulty): Puzzle {
  const solution = generateCompleteGrid();
  const carved = carvePuzzle(solution, difficulty);

  return {
    board: toBoard(carved),
    solution,
    difficulty,
  };
}

export function cloneBoard(board: Board): Board {
  return board.map((row) =>
    row.map((cell) => ({
      ...cell,
      notes: [...cell.notes],
    })),
  );
}

export function restartBoard(board: Board): Board {
  return board.map((row) =>
    row.map((cell) =>
      cell.given
        ? { ...cell, notes: [] }
        : { value: null, notes: [], given: false },
    ),
  );
}
