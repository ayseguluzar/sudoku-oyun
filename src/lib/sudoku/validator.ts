import { BOX, SIZE, type Board, type CellValue, type Grid } from "./types";

export function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => [...row]);
}

export function emptyGrid(): Grid {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

export function isSafe(grid: Grid, row: number, col: number, num: number): boolean {
  for (let i = 0; i < SIZE; i++) {
    if (grid[row][i] === num || grid[i][col] === num) return false;
  }

  const boxRow = Math.floor(row / BOX) * BOX;
  const boxCol = Math.floor(col / BOX) * BOX;

  for (let r = 0; r < BOX; r++) {
    for (let c = 0; c < BOX; c++) {
      if (grid[boxRow + r][boxCol + c] === num) return false;
    }
  }

  return true;
}

/** Conflicts for a candidate value at (row, col), ignoring the cell itself. */
export function findConflicts(
  board: Board,
  row: number,
  col: number,
  value: CellValue,
): { row: boolean; col: boolean; box: boolean } {
  if (!value) return { row: false, col: false, box: false };

  let rowConflict = false;
  let colConflict = false;
  let boxConflict = false;

  for (let i = 0; i < SIZE; i++) {
    if (i !== col && board[row][i].value === value) rowConflict = true;
    if (i !== row && board[i][col].value === value) colConflict = true;
  }

  const boxRow = Math.floor(row / BOX) * BOX;
  const boxCol = Math.floor(col / BOX) * BOX;

  for (let r = boxRow; r < boxRow + BOX; r++) {
    for (let c = boxCol; c < boxCol + BOX; c++) {
      if ((r !== row || c !== col) && board[r][c].value === value) {
        boxConflict = true;
      }
    }
  }

  return { row: rowConflict, col: colConflict, box: boxConflict };
}

export function hasConflict(board: Board, row: number, col: number): boolean {
  const { value } = board[row][col];
  if (!value) return false;
  const conflicts = findConflicts(board, row, col, value);
  return conflicts.row || conflicts.col || conflicts.box;
}

export function boardToGrid(board: Board): Grid {
  return board.map((row) => row.map((cell) => cell.value ?? 0));
}

export function isBoardComplete(board: Board): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!board[r][c].value || hasConflict(board, r, c)) return false;
    }
  }
  return true;
}

export function sameBox(r1: number, c1: number, r2: number, c2: number): boolean {
  return Math.floor(r1 / BOX) === Math.floor(r2 / BOX) && Math.floor(c1 / BOX) === Math.floor(c2 / BOX);
}

export function isAlternateBox(row: number, col: number): boolean {
  return (Math.floor(row / BOX) + Math.floor(col / BOX)) % 2 === 1;
}
