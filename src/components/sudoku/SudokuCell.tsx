"use client";

import { cn } from "@/lib/utils";
import type { CellState } from "@/lib/sudoku/types";

interface SudokuCellProps {
  cell: CellState;
  row: number;
  col: number;
  selected: boolean;
  related: boolean;
  sameNumber: boolean;
  conflict: boolean;
  alternateBox: boolean;
  onSelect: (row: number, col: number) => void;
}

export function SudokuCell({
  cell,
  row,
  col,
  selected,
  related,
  sameNumber,
  conflict,
  alternateBox,
  onSelect,
}: SudokuCellProps) {
  const thickRight = col === 2 || col === 5;
  const thickBottom = row === 2 || row === 5;

  return (
    <button
      type="button"
      onClick={() => onSelect(row, col)}
      aria-label={`Satır ${row + 1}, sütun ${col + 1}${cell.value ? `, değer ${cell.value}` : ""}`}
      aria-pressed={selected}
      className={cn(
        "relative flex aspect-square items-center justify-center",
        "border border-slate-300/80 text-[clamp(1rem,3.8vw,1.35rem)] font-semibold outline-none",
        "transition-colors duration-100",
        "focus-visible:z-20 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-inset",
        alternateBox ? "bg-slate-100/90" : "bg-white",
        related && !selected && "bg-teal-50/90",
        sameNumber && !selected && !conflict && "bg-teal-100/95 text-teal-800",
        selected && "z-10 bg-teal-200/95 ring-2 ring-inset ring-teal-500",
        conflict && "bg-rose-100 text-rose-600",
        conflict && selected && "bg-rose-200 ring-rose-500",
        cell.given ? "text-slate-900" : "text-teal-700",
        thickRight && "border-r-2 border-r-slate-500",
        thickBottom && "border-b-2 border-b-slate-500",
        col === 0 && "border-l-2 border-l-slate-500",
        row === 0 && "border-t-2 border-t-slate-500",
        col === 8 && "border-r-2 border-r-slate-500",
        row === 8 && "border-b-2 border-b-slate-500",
      )}
    >
      {cell.value ? (
        <span className={cn(conflict && "font-bold")}>{cell.value}</span>
      ) : cell.notes.length > 0 ? (
        <div className="grid size-full grid-cols-3 grid-rows-3 p-[8%] text-[clamp(0.45rem,1.6vw,0.65rem)] font-medium leading-none text-slate-500">
          {Array.from({ length: 9 }, (_, i) => {
            const n = i + 1;
            return (
              <span key={n} className="flex items-center justify-center">
                {cell.notes.includes(n) ? n : ""}
              </span>
            );
          })}
        </div>
      ) : null}
    </button>
  );
}
