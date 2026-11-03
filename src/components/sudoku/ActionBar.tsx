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
  "flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] font-semibold text-slate-600 transition active:scale-95 active:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-35 disabled:active:bg-transparent dark:text-slate-300 dark:active:bg-teal-950/50";

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
    <div className="flex items-stretch gap-1">
      <button type="button" className={cn(btn)} disabled={disabled || !canUndo} onClick={onUndo}>
        <Undo2 className="size-5" />
        Geri
      </button>
      <button type="button" className={cn(btn)} disabled={disabled || !canRedo} onClick={onRedo}>
        <Redo2 className="size-5" />
        İleri
      </button>
      <button type="button" className={cn(btn)} disabled={disabled} onClick={onHint}>
        <Lightbulb className="size-5" />
        İpucu
      </button>
      <button type="button" className={cn(btn)} disabled={disabled} onClick={onAutoNotes}>
        <Sparkles className="size-5" />
        Oto not
      </button>
    </div>
  );
}
