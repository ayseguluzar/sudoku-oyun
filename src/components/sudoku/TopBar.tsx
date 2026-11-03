"use client";

import { CalendarDays, Medal, Moon, Sun, Volume2, VolumeX, Vibrate } from "lucide-react";
import { useAppSettings } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

interface TopBarProps {
  isDaily: boolean;
  onDaily: () => void;
  onOpenScores: () => void;
}

const iconBtn =
  "inline-flex size-11 items-center justify-center rounded-2xl text-slate-600 transition active:scale-95 active:bg-slate-200/70 dark:text-slate-300 dark:active:bg-slate-700/80";

export function TopBar({ isDaily, onDaily, onOpenScores }: TopBarProps) {
  const { settings, toggleTheme, toggleSound, toggleVibrate } = useAppSettings();

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <h1 className="font-display text-[1.65rem] font-semibold leading-none tracking-tight text-teal-800 dark:text-teal-300">
          Sudoku
        </h1>
      </div>

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={onDaily}
          className={cn(
            "mr-1 inline-flex h-11 items-center gap-1.5 rounded-2xl px-3 text-sm font-semibold transition active:scale-95",
            isDaily
              ? "bg-teal-600 text-white shadow-sm shadow-teal-700/25"
              : "bg-white/70 text-slate-700 ring-1 ring-slate-200/80 dark:bg-slate-800/80 dark:text-slate-200 dark:ring-slate-700",
          )}
          aria-pressed={isDaily}
        >
          <CalendarDays className="size-4" />
          Günlük
        </button>
        <button type="button" className={iconBtn} onClick={toggleTheme} aria-label="Tema değiştir">
          {settings.theme === "dark" ? <Sun className="size-[1.15rem]" /> : <Moon className="size-[1.15rem]" />}
        </button>
        <button
          type="button"
          className={cn(iconBtn, !settings.sound && "opacity-45")}
          onClick={toggleSound}
          aria-label="Ses"
          aria-pressed={settings.sound}
        >
          {settings.sound ? <Volume2 className="size-[1.15rem]" /> : <VolumeX className="size-[1.15rem]" />}
        </button>
        <button
          type="button"
          className={cn(iconBtn, !settings.vibrate && "opacity-45")}
          onClick={toggleVibrate}
          aria-label="Titreşim"
          aria-pressed={settings.vibrate}
        >
          <Vibrate className="size-[1.15rem]" />
        </button>
        <button type="button" className={iconBtn} onClick={onOpenScores} aria-label="Puan tablosu">
          <Medal className="size-[1.15rem]" />
        </button>
      </div>
    </div>
  );
}
