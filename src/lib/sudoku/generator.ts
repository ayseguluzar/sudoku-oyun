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

type Rng = () => number;

function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function shuffle<T>(items: T[], rng: Rng): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function fillBoard(grid: Grid, rng: Rng): boolean {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (grid[row][col] !== 0) continue;

      for (const num of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rng)) {
        if (!isSafe(grid, row, col, num)) continue;
        grid[row][col] = num;
        if (fillBoard(grid, rng)) return true;
        grid[row][col] = 0;
      }
      return false;
    }
  }
  return true;
}

function generateCompleteGrid(rng: Rng): Grid {
  const grid = emptyGrid();
  fillBoard(grid, rng);
  return grid;
}

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

function clueTarget(difficulty: Difficulty, rng: Rng): number {
  const { min, max } = DIFFICULTY_CLUES[difficulty];
  return Math.floor(rng() * (max - min + 1)) + min;
}

function carvePuzzle(solution: Grid, difficulty: Difficulty, rng: Rng): Grid {
  const puzzle = cloneGrid(solution);
  const targetClues = clueTarget(difficulty, rng);
  const positions = shuffle(
    Array.from({ length: SIZE * SIZE }, (_, i) => ({
      row: Math.floor(i / SIZE),
      col: i % SIZE,
    })),
    rng,
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

function buildPuzzle(difficulty: Difficulty, rng: Rng, dailyKey?: string): Puzzle {
  const solution = generateCompleteGrid(rng);
  const carved = carvePuzzle(solution, difficulty, rng);
  return {
    board: toBoard(carved),
    solution,
    difficulty,
    dailyKey,
  };
}

export function createPuzzle(difficulty: Difficulty): Puzzle {
  return buildPuzzle(difficulty, Math.random);
}

export function createDailyPuzzle(difficulty: Difficulty, dateKey: string): Puzzle {
  const seed = hashSeed(`sudoku-daily-${dateKey}-${difficulty}`);
  return buildPuzzle(difficulty, mulberry32(seed), dateKey);
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
