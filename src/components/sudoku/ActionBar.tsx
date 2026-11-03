"use client";

import { Lightbulb, Redo2, Sparkles, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionBarProps {
  disabled?: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onHint: () => void;
  onAutoNotes: () => void;
}

const btn =
  "flex flex-col items-center justify-center gap-1 rounded-xl bg-white px-2 py-2.5 text-[11px] font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-teal-50 hover:text-teal-800 hover:ring-teal-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-700 disabled:hover:ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700 dark:disabled:hover:bg-slate-800";

export function ActionBar({
  disabled,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onHint,
  onAutoNotes,
}: ActionBarProps) {
  return (
    <div className="mx-auto grid w-full max-w-[min(100%,28rem)] grid-cols-4 gap-2">
      <button type="button" className={cn(btn)} disabled={disabled || !canUndo} onClick={onUndo}>
        <Undo2 className="size-4" />
        Geri
      </button>
      <button type="button" className={cn(btn)} disabled={disabled || !canRedo} onClick={onRedo}>
        <Redo2 className="size-4" />
        İleri
      </button>
      <button type="button" className={cn(btn)} disabled={disabled} onClick={onHint}>
        <Lightbulb className="size-4" />
        İpucu
      </button>
      <button type="button" className={cn(btn)} disabled={disabled} onClick={onAutoNotes}>
        <Sparkles className="size-4" />
        Oto not
      </button>
    </div>
  );
}
