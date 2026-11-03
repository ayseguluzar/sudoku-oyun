"use client";

import { Clock, Heart, Trophy } from "lucide-react";
import { formatTime } from "@/lib/sudoku/storage";
import { cn } from "@/lib/utils";

const MAX_MISTAKES = 3;

interface StatusBarProps {
  seconds: number;
  bestSeconds: number | null;
  mistakes: number;
}

export function StatusBar({ seconds, bestSeconds, mistakes }: StatusBarProps) {
  return (
    <div className="mx-auto grid w-full max-w-[min(100%,28rem)] grid-cols-3 gap-2">
      <div className="flex flex-col items-center rounded-xl bg-white/80 px-2 py-2 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-800/80 dark:ring-slate-700">
        <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <Clock className="size-3.5" />
          Süre
        </div>
        <p className="mt-0.5 font-display text-lg font-semibold tabular-nums text-slate-800 dark:text-slate-100">
          {formatTime(seconds)}
        </p>
      </div>

      <div className="flex flex-col items-center rounded-xl bg-white/80 px-2 py-2 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-800/80 dark:ring-slate-700">
        <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <Trophy className="size-3.5" />
          Rekor
        </div>
        <p className="mt-0.5 font-display text-lg font-semibold tabular-nums text-teal-700 dark:text-teal-300">
          {bestSeconds !== null ? formatTime(bestSeconds) : "—"}
        </p>
      </div>

      <div className="flex flex-col items-center rounded-xl bg-white/80 px-2 py-2 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-800/80 dark:ring-slate-700">
        <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <Heart className="size-3.5" />
          Hata
        </div>
        <div className="mt-1 flex items-center gap-1">
          {Array.from({ length: MAX_MISTAKES }, (_, i) => (
            <span
              key={i}
              className={cn(
                "size-2.5 rounded-full",
                i < mistakes ? "bg-rose-500" : "bg-slate-200 dark:bg-slate-600",
              )}
              aria-hidden
            />
          ))}
          <span className="ml-1 text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-200">
            {mistakes}/{MAX_MISTAKES}
          </span>
        </div>
      </div>
    </div>
  );
}

export { MAX_MISTAKES };
