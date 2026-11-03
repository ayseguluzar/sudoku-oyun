"use client";

import { Clock, Flame, Heart, Trophy } from "lucide-react";
import { formatTime } from "@/lib/sudoku/storage";
import { cn } from "@/lib/utils";

const MAX_MISTAKES = 3;

interface StatusBarProps {
  seconds: number;
  bestSeconds: number | null;
  mistakes: number;
  streak?: number;
}

export function StatusBar({ seconds, bestSeconds, mistakes, streak = 0 }: StatusBarProps) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl bg-white/70 px-3 py-2.5 ring-1 ring-slate-200/70 dark:bg-slate-800/70 dark:ring-slate-700/80">
      <div className="flex min-w-0 items-center gap-1.5">
        <Clock className="size-3.5 shrink-0 text-slate-400" />
        <span className="font-display text-base font-semibold tabular-nums tracking-tight text-slate-800 dark:text-slate-100">
          {formatTime(seconds)}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Trophy className="size-3.5 text-teal-600 dark:text-teal-300" />
        <span className="font-display text-sm font-semibold tabular-nums text-teal-700 dark:text-teal-300">
          {bestSeconds !== null ? formatTime(bestSeconds) : "—"}
        </span>
      </div>

      <div
        className="flex items-center gap-1"
        aria-label={streak > 0 ? `Günlük seri ${streak}` : "Günlük seri yok"}
      >
        <Flame className={cn("size-3.5", streak > 0 ? "text-orange-500" : "text-slate-300 dark:text-slate-600")} />
        <span
          className={cn(
            "font-display text-sm font-semibold tabular-nums",
            streak > 0 ? "text-orange-600 dark:text-orange-300" : "text-slate-400",
          )}
        >
          {streak}
        </span>
      </div>

      <div className="flex items-center gap-1.5" aria-label={`Hata ${mistakes} / ${MAX_MISTAKES}`}>
        <Heart className="size-3.5 text-rose-400" />
        <div className="flex items-center gap-1">
          {Array.from({ length: MAX_MISTAKES }, (_, i) => (
            <span
              key={i}
              className={cn(
                "size-2 rounded-full transition-colors",
                i < mistakes ? "bg-rose-500" : "bg-slate-200 dark:bg-slate-600",
              )}
              aria-hidden
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export { MAX_MISTAKES };
