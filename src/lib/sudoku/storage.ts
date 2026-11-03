import type { Board, Difficulty, Puzzle } from "./types";

const BEST_KEY = "sudoku-best-times";
const PROGRESS_KEY = "sudoku-progress-v1";
const SCORES_KEY = "sudoku-scores-v1";
const SETTINGS_KEY = "sudoku-settings-v1";
const STREAK_KEY = "sudoku-daily-streak-v1";

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

function isValidBoard(board: unknown): board is Board {
  if (!Array.isArray(board) || board.length !== 9) return false;
  return board.every(
    (row) =>
      Array.isArray(row) &&
      row.length === 9 &&
      row.every(
        (cell) =>
          cell &&
          typeof cell === "object" &&
          ("value" in cell) &&
          ("notes" in cell) &&
          ("given" in cell),
      ),
  );
}

function isValidGrid(grid: unknown): grid is number[][] {
  if (!Array.isArray(grid) || grid.length !== 9) return false;
  return grid.every(
    (row) => Array.isArray(row) && row.length === 9 && row.every((n) => typeof n === "number"),
  );
}

export function isValidProgress(data: SavedProgress | null): data is SavedProgress {
  if (!data || data.version !== 1) return false;
  if (!data.puzzle || !isValidBoard(data.puzzle.board) || !isValidGrid(data.puzzle.solution)) return false;
  if (!isValidBoard(data.board) || !isValidBoard(data.initialBoard)) return false;
  if (data.difficulty !== "easy" && data.difficulty !== "medium" && data.difficulty !== "hard") return false;
  if (data.mode !== "normal" && data.mode !== "daily") return false;
  return true;
}

export function loadProgress(): SavedProgress | null {
  const data = readJson<SavedProgress | null>(PROGRESS_KEY, null);
  if (!isValidProgress(data)) {
    if (data) clearProgress();
    return null;
  }
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

export interface DailyStreak {
  current: number;
  best: number;
  lastDate: string | null;
}

function shiftDateKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return todayKey(dt);
}

export function loadStreak(): DailyStreak {
  const data = readJson<Partial<DailyStreak>>(STREAK_KEY, {});
  const streak: DailyStreak = {
    current: typeof data.current === "number" ? Math.max(0, data.current) : 0,
    best: typeof data.best === "number" ? Math.max(0, data.best) : 0,
    lastDate: typeof data.lastDate === "string" ? data.lastDate : null,
  };

  const today = todayKey();
  if (!streak.lastDate) return streak;
  if (streak.lastDate === today || streak.lastDate === shiftDateKey(today, -1)) return streak;

  // Seri kırıldı
  return { current: 0, best: streak.best, lastDate: streak.lastDate };
}

export function recordDailyWin(dateKey = todayKey()): DailyStreak {
  const prev = loadStreak();
  if (prev.lastDate === dateKey) {
    return prev;
  }

  const yesterday = shiftDateKey(dateKey, -1);
  const current = prev.lastDate === yesterday ? prev.current + 1 : 1;
  const next: DailyStreak = {
    current,
    best: Math.max(prev.best, current),
    lastDate: dateKey,
  };
  writeJson(STREAK_KEY, next);
  return next;
}

export function buildShareText(opts: {
  difficulty: Difficulty;
  seconds: number;
  mistakes: number;
  mode: GameMode;
  streak?: number;
  isNewBest?: boolean;
}): string {
  const labels: Record<Difficulty, string> = {
    easy: "Kolay",
    medium: "Orta",
    hard: "Zor",
  };
  const lines = [
    "🧩 Sudoku tamamlandı!",
    `${opts.mode === "daily" ? "Günlük" : "Klasik"} · ${labels[opts.difficulty]}`,
    `⏱ ${formatTime(opts.seconds)} · ❌ ${opts.mistakes} hata`,
  ];
  if (opts.mode === "daily" && opts.streak && opts.streak > 0) {
    lines.push(`🔥 ${opts.streak} günlük seri`);
  }
  if (opts.isNewBest) lines.push("🏆 Yeni rekor!");
  lines.push("https://sudoku-oyun.vercel.app");
  return lines.join("\n");
}

export async function shareResult(text: string): Promise<"shared" | "copied" | "failed"> {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      await navigator.share({ title: "Sudoku", text });
      return "shared";
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return "failed";
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return "copied";
    }
  } catch {
    // fallthrough
  }
  return "failed";
}
