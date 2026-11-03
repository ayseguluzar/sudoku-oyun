"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Share2, Trophy, X } from "lucide-react";
import { buildShareText, formatTime, shareResult, type GameMode } from "@/lib/sudoku/storage";
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
  seconds: number;
  mistakes: number;
  mode: GameMode;
  streak: number;
  isNewBest: boolean;
  onNewGame: () => void;
  onClose: () => void;
}

export function WinModal({
  open,
  difficulty,
  seconds,
  mistakes,
  mode,
  streak,
  isNewBest,
  onNewGame,
  onClose,
}: WinModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [shareState, setShareState] = useState<"idle" | "shared" | "copied" | "failed">("idle");

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

  const handleShare = async () => {
    const text = buildShareText({
      difficulty,
      seconds,
      mistakes,
      mode,
      streak: mode === "daily" ? streak : undefined,
      isNewBest,
    });
    const result = await shareResult(text);
    setShareState(result === "failed" ? "failed" : result);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sudoku-win-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-[3px]"
        aria-label="Kapat"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm overflow-hidden rounded-t-[1.75rem] border border-teal-200/80 bg-white shadow-2xl shadow-teal-900/15 sm:rounded-[1.75rem] dark:border-teal-900/50 dark:bg-slate-900">
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-slate-200 sm:hidden dark:bg-slate-700" aria-hidden />
        <div className="bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-500 px-6 pb-8 pt-5 text-white">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-xl p-2 text-white/80 transition active:bg-white/15"
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
            {mode === "daily" ? "Günlük" : LABELS[difficulty]} bulmacayı {formatTime(seconds)} sürede tamamladın.
          </p>
          {mode === "daily" && streak > 0 && (
            <p className="mt-2 text-center text-sm font-semibold text-amber-100">🔥 {streak} günlük seri</p>
          )}
          {isNewBest && (
            <p className="mt-2 text-center text-sm font-semibold text-amber-100">Yeni rekor!</p>
          )}
        </div>
        <div className="flex flex-col gap-2 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onNewGame}
            className={cn(
              "min-h-12 rounded-2xl bg-teal-600 px-4 text-sm font-semibold text-white",
              "transition active:scale-[0.98] active:bg-teal-700",
            )}
          >
            Yeni Oyun
          </button>
          <button
            type="button"
            onClick={() => void handleShare()}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition active:scale-[0.98] dark:bg-slate-800 dark:text-slate-200"
          >
            {shareState === "copied" || shareState === "shared" ? (
              <>
                <Check className="size-4 text-teal-600" />
                {shareState === "copied" ? "Kopyalandı" : "Paylaşıldı"}
              </>
            ) : (
              <>
                <Share2 className="size-4" />
                {shareState === "failed" ? "Tekrar dene" : "Sonucu paylaş"}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 rounded-2xl px-4 text-sm font-semibold text-slate-600 transition active:bg-slate-100 dark:text-slate-300 dark:active:bg-slate-800"
          >
            Tahtaya Dön
          </button>
        </div>
      </div>
    </div>
  );
}
