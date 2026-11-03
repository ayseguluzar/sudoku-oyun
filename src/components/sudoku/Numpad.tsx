"use client";

import { Delete, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface NumpadProps {
  notesMode: boolean;
  onNumber: (n: number) => void;
  onErase: () => void;
  onToggleNotes: () => void;
  disabled?: boolean;
}

export function Numpad({
  notesMode,
  onNumber,
  onErase,
  onToggleNotes,
  disabled,
}: NumpadProps) {
  return (
    <div className="mx-auto w-full max-w-[min(100%,28rem)] space-y-3">
      <div className="grid grid-cols-9 gap-1.5 sm:gap-2">
        {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onNumber(n)}
            className={cn(
              "aspect-square rounded-xl text-lg font-semibold sm:text-xl",
              "bg-white text-slate-800 shadow-sm ring-1 ring-slate-200",
              "transition hover:bg-teal-50 hover:text-teal-800 hover:ring-teal-300",
              "active:scale-95 disabled:cursor-not-allowed disabled:opacity-40",
              notesMode && "text-slate-500",
            )}
          >
            {n}
          </button>
        ))}
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
              : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
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
          )}
        >
          <Delete className="size-4" />
          Sil
        </button>
      </div>
    </div>
  );
}
