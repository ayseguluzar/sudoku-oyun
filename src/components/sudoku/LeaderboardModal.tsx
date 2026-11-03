"use client";

import { useEffect, useState } from "react";
import { Medal, X } from "lucide-react";
import { formatTime, scoresForDifficulty, type ScoreEntry } from "@/lib/sudoku/storage";
import type { Difficulty } from "@/lib/sudoku/types";
import { cn } from "@/lib/utils";

const TABS: { id: Difficulty; label: string }[] = [
  { id: "easy", label: "Kolay" },
  { id: "medium", label: "Orta" },
  { id: "hard", label: "Zor" },
];

interface LeaderboardModalProps {
  open: boolean;
  onClose: () => void;
  refreshKey?: number;
}

export function LeaderboardModal({ open, onClose, refreshKey = 0 }: LeaderboardModalProps) {
  const [tab, setTab] = useState<Difficulty>("easy");
  const [scores, setScores] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => setScores(scoresForDifficulty(tab, 10)), 0);
    return () => window.clearTimeout(id);
  }, [open, tab, refreshKey]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-[3px]"
        aria-label="Kapat"
        onClick={onClose}
      />
      <div className="relative flex max-h-[88dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[1.75rem] border border-slate-200 bg-white shadow-2xl sm:rounded-[1.75rem] dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-slate-200 sm:hidden dark:bg-slate-700" aria-hidden />
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <Medal className="size-5 text-teal-600" />
            <h2 className="font-display text-lg font-semibold">Puan tablosu</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 transition active:bg-slate-100 dark:active:bg-slate-800"
            aria-label="Kapat"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1 p-3">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "min-h-11 rounded-2xl px-2 text-sm font-semibold transition active:scale-[0.98]",
                tab === id
                  ? "bg-teal-600 text-white"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {scores.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">Henüz skor yok. Bir oyun bitir!</p>
          ) : (
            <ul className="space-y-2">
              {scores.map((s, i) => (
                <ScoreRow key={s.id} rank={i + 1} entry={s} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreRow({ rank, entry }: { rank: number; entry: ScoreEntry }) {
  return (
    <li className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3 dark:bg-slate-800/80">
      <div className="flex items-center gap-3">
        <span className="flex size-8 items-center justify-center rounded-full bg-white text-xs font-bold text-teal-700 shadow-sm dark:bg-slate-700 dark:text-teal-300">
          {rank}
        </span>
        <div>
          <p className="text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-100">
            {formatTime(entry.seconds)}
          </p>
          <p className="text-[11px] text-slate-500">
            {entry.date} · {entry.mistakes} hata{entry.mode === "daily" ? " · günlük" : ""}
          </p>
        </div>
      </div>
    </li>
  );
}
