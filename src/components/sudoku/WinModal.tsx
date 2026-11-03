"use client";

import { useEffect, useRef } from "react";
import { Trophy, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Difficulty } from "@/lib/sudoku/types";

const LABELS: Record<Difficulty, string> = {
  easy: "Kolay",
  medium: "Orta",
  hard: "Zor",
};

interface WinModalProps {
  open: boolean;
  difficulty: Difficulty;
  onNewGame: () => void;
  onClose: () => void;
}

export function WinModal({ open, difficulty, onNewGame, onClose }: WinModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sudoku-win-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
        aria-label="Kapat"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-teal-200/80 bg-white shadow-2xl shadow-teal-900/15">
        <div className="bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-500 px-6 pb-8 pt-6 text-white">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-lg p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white"
            aria-label="Kapat"
          >
            <X className="size-5" />
          </button>
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30">
            <Trophy className="size-7" />
          </div>
          <h2 id="sudoku-win-title" className="text-center font-display text-2xl font-semibold tracking-tight">
            Tebrikler!
          </h2>
          <p className="mt-2 text-center text-sm text-teal-50">
            {LABELS[difficulty]} bulmacayı başarıyla tamamladın.
          </p>
        </div>
        <div className="flex flex-col gap-2 p-5">
          <button
            type="button"
            onClick={onNewGame}
            className={cn(
              "rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white",
              "transition hover:bg-teal-700 active:scale-[0.98]",
            )}
          >
            Yeni Oyun
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Tahtaya Dön
          </button>
        </div>
      </div>
    </div>
  );
}
