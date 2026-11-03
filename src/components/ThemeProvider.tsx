"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loadSettings, saveSettings, type AppSettings } from "@/lib/sudoku/storage";

interface ThemeContextValue {
  settings: AppSettings;
  setTheme: (theme: AppSettings["theme"]) => void;
  toggleTheme: () => void;
  toggleSound: () => void;
  toggleVibrate: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>({
    theme: "light",
    sound: true,
    vibrate: true,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);
    document.documentElement.classList.toggle("dark", loaded.theme === "dark");
    setReady(true);
  }, []);

  const persist = useCallback((next: AppSettings) => {
    setSettings(next);
    saveSettings(next);
    document.documentElement.classList.toggle("dark", next.theme === "dark");
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      settings,
      setTheme: (theme) => persist({ ...settings, theme }),
      toggleTheme: () => persist({ ...settings, theme: settings.theme === "dark" ? "light" : "dark" }),
      toggleSound: () => persist({ ...settings, sound: !settings.sound }),
      toggleVibrate: () => persist({ ...settings, vibrate: !settings.vibrate }),
    }),
    [settings, persist],
  );

  if (!ready) {
    return <div className="min-h-dvh bg-background" />;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppSettings() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useAppSettings must be used within ThemeProvider");
  return ctx;
}
