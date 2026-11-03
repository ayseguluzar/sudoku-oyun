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
    <div className="flex items-center gap-2">
      <div
        className="grid flex-1 grid-cols-3 rounded-2xl bg-slate-200/80 p-1 dark:bg-slate-800/90"
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
              "h-10 rounded-xl text-sm font-semibold transition active:scale-[0.98]",
              "disabled:cursor-wait disabled:opacity-60",
              difficulty === id
                ? "bg-white text-teal-800 shadow-sm dark:bg-slate-700 dark:text-teal-200"
                : "text-slate-500 dark:text-slate-400",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={generating}
        onClick={onNewGame}
        className={cn(
          "inline-flex size-11 shrink-0 items-center justify-center rounded-2xl",
          "bg-teal-600 text-white shadow-sm shadow-teal-700/20",
          "transition active:scale-95 disabled:cursor-wait disabled:opacity-60",
        )}
        aria-label={generating ? "Hazırlanıyor" : "Yeni oyun"}
      >
        <Sparkles className="size-5" />
      </button>
      <button
        type="button"
        disabled={generating}
        onClick={onRestart}
        className={cn(
          "inline-flex size-11 shrink-0 items-center justify-center rounded-2xl",
          "bg-white/80 text-slate-700 ring-1 ring-slate-200/80",
          "transition active:scale-95 disabled:opacity-40",
          "dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700",
        )}
        aria-label="Baştan başlat"
      >
        <RefreshCw className="size-5" />
      </button>
    </div>
  );
}
