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
    <div className="mx-auto w-full max-w-[min(100%,28rem)] space-y-3">
      <div className="grid grid-cols-9 gap-1.5 sm:gap-2">
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
                "relative flex aspect-square flex-col items-center justify-center rounded-xl",
                "bg-white text-slate-800 shadow-sm ring-1 ring-slate-200",
                "transition hover:bg-teal-50 hover:text-teal-800 hover:ring-teal-300",
                "active:scale-95 disabled:cursor-not-allowed disabled:opacity-35",
                "dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-700",
                notesMode && "text-slate-500 dark:text-slate-400",
              )}
              aria-label={`${n}, kalan ${left}`}
            >
              <span className="text-lg font-semibold leading-none sm:text-xl">{n}</span>
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
            "flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold",
            "shadow-sm ring-1 transition active:scale-[0.98]",
            "disabled:cursor-not-allowed disabled:opacity-40",
            notesMode
              ? "bg-teal-600 text-white ring-teal-600"
              : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700",
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
            "flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold",
            "bg-white text-slate-700 shadow-sm ring-1 ring-slate-200",
            "transition hover:bg-rose-50 hover:text-rose-700 hover:ring-rose-200",
            "active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40",
            "dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-rose-950",
          )}
        >
          <Delete className="size-4" />
          Sil
        </button>
      </div>
    </div>
  );
}
