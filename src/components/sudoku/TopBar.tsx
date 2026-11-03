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
  "inline-flex size-10 items-center justify-center rounded-xl bg-white/80 text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-teal-50 hover:text-teal-800 dark:bg-slate-800/90 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700";

export function TopBar({ isDaily, onDaily, onOpenScores }: TopBarProps) {
  const { settings, toggleTheme, toggleSound, toggleVibrate } = useAppSettings();

  return (
    <div className="mx-auto flex w-full max-w-[min(100%,28rem)] items-center justify-between gap-2">
      <button
        type="button"
        onClick={onDaily}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold shadow-sm ring-1 transition",
          isDaily
            ? "bg-teal-600 text-white ring-teal-600"
            : "bg-white/80 text-slate-700 ring-slate-200 hover:bg-teal-50 dark:bg-slate-800/90 dark:text-slate-200 dark:ring-slate-700",
        )}
      >
        <CalendarDays className="size-4" />
        Günlük
      </button>

      <div className="flex items-center gap-1.5">
        <button type="button" className={iconBtn} onClick={toggleTheme} aria-label="Tema değiştir">
          {settings.theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
        <button
          type="button"
          className={cn(iconBtn, !settings.sound && "opacity-60")}
          onClick={toggleSound}
          aria-label="Ses"
          aria-pressed={settings.sound}
        >
          {settings.sound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
        </button>
        <button
          type="button"
          className={cn(iconBtn, !settings.vibrate && "opacity-60")}
          onClick={toggleVibrate}
          aria-label="Titreşim"
          aria-pressed={settings.vibrate}
        >
          <Vibrate className="size-4" />
        </button>
        <button type="button" className={iconBtn} onClick={onOpenScores} aria-label="Puan tablosu">
          <Medal className="size-4" />
        </button>
      </div>
    </div>
  );
}
