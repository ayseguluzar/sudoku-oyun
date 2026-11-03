"use client";

import { useEffect, useRef } from "react";
import { Frown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameOverModalProps {
  open: boolean;
  onNewGame: () => void;
  onRestart: () => void;
  onClose: () => void;
}

export function GameOverModal({ open, onNewGame, onRestart, onClose }: GameOverModalProps) {
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
      aria-labelledby="sudoku-lose-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
        aria-label="Kapat"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-rose-200/80 bg-white shadow-2xl shadow-rose-900/10">
        <div className="bg-gradient-to-br from-rose-600 via-rose-500 to-orange-400 px-6 pb-8 pt-6 text-white">
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
            <Frown className="size-7" />
          </div>
          <h2 id="sudoku-lose-title" className="text-center font-display text-2xl font-semibold tracking-tight">
            Oyun bitti
          </h2>
          <p className="mt-2 text-center text-sm text-rose-50">
            3 hatalık hakkın doldu. Tekrar dene!
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
            onClick={onRestart}
            className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Aynı bulmacaya baştan
          </button>
        </div>
      </div>
    </div>
  );
}
