"use client";

import { SudokuCell } from "./SudokuCell";
import { hasConflict, isAlternateBox, sameBox } from "@/lib/sudoku/validator";
import type { Board } from "@/lib/sudoku/types";

interface SudokuBoardProps {
  board: Board;
  selected: { row: number; col: number } | null;
  onSelect: (row: number, col: number) => void;
}

export function SudokuBoard({ board, selected, onSelect }: SudokuBoardProps) {
  const selectedValue =
    selected && board[selected.row][selected.col].value
      ? board[selected.row][selected.col].value
      : null;

  return (
    <div
      className="mx-auto w-full max-w-[min(100%,28rem)] overflow-hidden rounded-xl shadow-lg shadow-slate-900/10 ring-1 ring-slate-300/80"
      role="grid"
      aria-label="Sudoku tahtası"
    >
      <div className="grid grid-cols-9">
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isSelected = selected?.row === r && selected?.col === c;
            const related = Boolean(
              selected &&
                !isSelected &&
                (selected.row === r ||
                  selected.col === c ||
                  sameBox(selected.row, selected.col, r, c)),
            );
            const sameNumber = Boolean(
              selectedValue && cell.value === selectedValue && !isSelected,
            );

            return (
              <SudokuCell
                key={`${r}-${c}`}
                cell={cell}
                row={r}
                col={c}
                selected={isSelected}
                related={related}
                sameNumber={sameNumber}
                conflict={hasConflict(board, r, c)}
                alternateBox={isAlternateBox(r, c)}
                onSelect={onSelect}
              />
            );
          }),
        )}
      </div>
    </div>
  );
}
