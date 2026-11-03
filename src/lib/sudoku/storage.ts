import type { Board, Difficulty, Puzzle } from "./types";

const BEST_KEY = "sudoku-best-times";
const PROGRESS_KEY = "sudoku-progress-v1";
const SCORES_KEY = "sudoku-scores-v1";
const SETTINGS_KEY = "sudoku-settings-v1";

export type BestTimes = Partial<Record<Difficulty, number>>;
export type GameMode = "normal" | "daily";

export interface SavedProgress {
  version: 1;
  mode: GameMode;
  dailyKey?: string;
  difficulty: Difficulty;
  puzzle: Puzzle;
  board: Board;
  initialBoard: Board;
  mistakes: number;
  seconds: number;
  notesMode: boolean;
  savedAt: number;
}

export interface ScoreEntry {
  id: string;
  difficulty: Difficulty;
  seconds: number;
  mistakes: number;
  mode: GameMode;
  date: string;
}

export interface AppSettings {
  theme: "light" | "dark";
  sound: boolean;
  vibrate: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: "light",
  sound: true,
  vibrate: true,
};

export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadBestTimes(): BestTimes {
  return readJson<BestTimes>(BEST_KEY, {});
}

export function saveBestTime(difficulty: Difficulty, seconds: number): number | null {
  const current = loadBestTimes();
  const prev = current[difficulty];
  if (prev !== undefined && seconds >= prev) return prev;
  writeJson(BEST_KEY, { ...current, [difficulty]: seconds });
  return seconds;
}

export function loadSettings(): AppSettings {
  return { ...DEFAULT_SETTINGS, ...readJson<Partial<AppSettings>>(SETTINGS_KEY, {}) };
}

export function saveSettings(settings: AppSettings) {
  writeJson(SETTINGS_KEY, settings);
}

export function saveProgress(progress: SavedProgress) {
  writeJson(PROGRESS_KEY, progress);
}

export function loadProgress(): SavedProgress | null {
  const data = readJson<SavedProgress | null>(PROGRESS_KEY, null);
  if (!data || data.version !== 1) return null;
  if (data.mode === "daily" && data.dailyKey !== todayKey()) {
    clearProgress();
    return null;
  }
  return data;
}

export function clearProgress() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROGRESS_KEY);
}

export function loadScores(): ScoreEntry[] {
  return readJson<ScoreEntry[]>(SCORES_KEY, []);
}

export function addScore(entry: Omit<ScoreEntry, "id">): ScoreEntry[] {
  const next: ScoreEntry = { ...entry, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
  const all = [next, ...loadScores()]
    .sort((a, b) => a.seconds - b.seconds || a.mistakes - b.mistakes)
    .slice(0, 60);
  writeJson(SCORES_KEY, all);
  return all;
}

export function scoresForDifficulty(difficulty: Difficulty, limit = 10): ScoreEntry[] {
  return loadScores()
    .filter((s) => s.difficulty === difficulty)
    .sort((a, b) => a.seconds - b.seconds || a.mistakes - b.mistakes)
    .slice(0, limit);
}
