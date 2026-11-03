"use client";

import { RefreshCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Difficulty } from "@/lib/sudoku/types";

const DIFFICULTIES: { id: Difficulty; label: string }[] = [
  { id: "easy", label: "Kolay" },
  { id: "medium", label: "Orta" },
  { id: "hard", label: "Zor" },
];

interface GameControlsProps {
  difficulty: Difficulty;
  generating: boolean;
  onDifficultyChange: (d: Difficulty) => void;
  onNewGame: () => void;
  onRestart: () => void;
}

export function GameControls({
  difficulty,
  generating,
  onDifficultyChange,
  onNewGame,
  onRestart,
}: GameControlsProps) {
  return (
    <div className="mx-auto flex w-full max-w-[min(100%,28rem)] flex-col gap-3">
      <div
        className="grid grid-cols-3 gap-1 rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800"
        role="radiogroup"
        aria-label="Zorluk"
      >
        {DIFFICULTIES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={difficulty === id}
            disabled={generating}
            onClick={() => onDifficultyChange(id)}
            className={cn(
              "rounded-lg px-2 py-2 text-sm font-semibold transition",
              "disabled:cursor-wait disabled:opacity-60",
              difficulty === id
                ? "bg-white text-teal-800 shadow-sm dark:bg-slate-700 dark:text-teal-200"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={generating}
          onClick={onNewGame}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold",
            "bg-teal-600 text-white shadow-sm transition",
            "hover:bg-teal-700 active:scale-[0.98]",
            "disabled:cursor-wait disabled:opacity-60",
          )}
        >
          <Sparkles className="size-4" />
          {generating ? "Hazırlanıyor…" : "Yeni Oyun"}
        </button>
        <button
          type="button"
          disabled={generating}
          onClick={onRestart}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold",
            "bg-white text-slate-700 shadow-sm ring-1 ring-slate-200",
            "transition hover:bg-slate-50 active:scale-[0.98]",
            "disabled:cursor-not-allowed disabled:opacity-40",
            "dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700",
          )}
        >
          <RefreshCw className="size-4" />
          Baştan
        </button>
      </div>
    </div>
  );
}
