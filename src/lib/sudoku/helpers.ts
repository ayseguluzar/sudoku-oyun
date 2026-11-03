import { BOX, SIZE, type Board, type Grid } from "./types";
import { cloneBoard } from "./generator";

export function getCandidates(board: Board, row: number, col: number): number[] {
  if (board[row][col].value) return [];

  const used = new Set<number>();

  for (let i = 0; i < SIZE; i++) {
    const rowVal = board[row][i].value;
    const colVal = board[i][col].value;
    if (rowVal) used.add(rowVal);
    if (colVal) used.add(colVal);
  }

  const boxRow = Math.floor(row / BOX) * BOX;
  const boxCol = Math.floor(col / BOX) * BOX;
  for (let r = boxRow; r < boxRow + BOX; r++) {
    for (let c = boxCol; c < boxCol + BOX; c++) {
      const v = board[r][c].value;
      if (v) used.add(v);
    }
  }

  return Array.from({ length: SIZE }, (_, i) => i + 1).filter((n) => !used.has(n));
}

export function fillAutoNotes(board: Board): Board {
  const next = cloneBoard(board);
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (next[r][c].value || next[r][c].given) continue;
      next[r][c].notes = getCandidates(next, r, c);
    }
  }
  return next;
}

export function remainingCounts(board: Board): number[] {
  const counts = Array(10).fill(0);
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = board[r][c].value;
      if (v) counts[v] += 1;
    }
  }
  return Array.from({ length: 9 }, (_, i) => Math.max(0, 9 - counts[i + 1]));
}

export function isSolved(board: Board, solution: Grid): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c].value !== solution[r][c]) return false;
    }
  }
  return true;
}

export function findHintCell(
  board: Board,
  solution: Grid,
  preferred: { row: number; col: number } | null,
): { row: number; col: number } | null {
  if (
    preferred &&
    !board[preferred.row][preferred.col].given &&
    board[preferred.row][preferred.col].value !== solution[preferred.row][preferred.col]
  ) {
    return preferred;
  }

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!board[r][c].given && board[r][c].value !== solution[r][c]) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}
