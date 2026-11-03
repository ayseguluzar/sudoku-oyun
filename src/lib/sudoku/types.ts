export type Difficulty = "easy" | "medium" | "hard";

export type CellValue = number | null;

export interface CellState {
  value: CellValue;
  notes: number[];
  given: boolean;
}

export type Board = CellState[][];

export type Grid = number[][];

export interface Puzzle {
  board: Board;
  solution: Grid;
  difficulty: Difficulty;
}

export const DIFFICULTY_CLUES: Record<Difficulty, { min: number; max: number }> = {
  easy: { min: 40, max: 46 },
  medium: { min: 30, max: 36 },
  hard: { min: 22, max: 28 },
};

export const SIZE = 9;
export const BOX = 3;
