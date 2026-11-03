"use client";

import { Delete, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface NumpadProps {
  notesMode: boolean;
  remaining: number[];
  onNumber: (n: number) => void;
  onErase: () => void;
  onToggleNotes: () => void;
  disabled?: boolean;
}

export function Numpad({
  notesMode,
  remaining,
  onNumber,
  onErase,
  onToggleNotes,
  disabled,
}: NumpadProps) {
  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-9 gap-1.5">
        {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => {
          const left = remaining[n - 1] ?? 0;
          const depleted = left === 0;
          return (
            <button
              key={n}
              type="button"
              disabled={disabled || (!notesMode && depleted)}
              onClick={() => onNumber(n)}
              className={cn(
                "relative flex min-h-12 flex-col items-center justify-center rounded-2xl",
                "bg-slate-100/90 text-slate-800 dark:bg-slate-900/80 dark:text-slate-100",
                "transition active:scale-95 active:bg-teal-100 dark:active:bg-teal-900/60",
                "disabled:cursor-not-allowed disabled:opacity-30",
                notesMode && "text-slate-500 dark:text-slate-400",
              )}
              aria-label={`${n}, kalan ${left}`}
            >
              <span className="font-display text-xl font-semibold leading-none">{n}</span>
              <span
                className={cn(
                  "mt-0.5 text-[10px] font-semibold tabular-nums",
                  depleted ? "text-slate-300 dark:text-slate-600" : "text-teal-600 dark:text-teal-300",
                )}
              >
                {left}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onToggleNotes}
          className={cn(
            "flex min-h-12 items-center justify-center gap-2 rounded-2xl text-sm font-semibold",
            "transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40",
            notesMode
              ? "bg-teal-600 text-white shadow-sm shadow-teal-700/20"
              : "bg-slate-100/90 text-slate-700 dark:bg-slate-900/80 dark:text-slate-200",
          )}
          aria-pressed={notesMode}
        >
          <Pencil className="size-4" />
          Notlar
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onErase}
          className={cn(
            "flex min-h-12 items-center justify-center gap-2 rounded-2xl text-sm font-semibold",
            "bg-slate-100/90 text-slate-700 transition active:scale-[0.98] active:bg-rose-50 active:text-rose-700",
            "disabled:cursor-not-allowed disabled:opacity-40",
            "dark:bg-slate-900/80 dark:text-slate-200 dark:active:bg-rose-950 dark:active:text-rose-300",
          )}
        >
          <Delete className="size-4" />
          Sil
        </button>
      </div>
    </div>
  );
}
