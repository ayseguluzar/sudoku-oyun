"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useAppSettings } from "@/components/ThemeProvider";
import { ActionBar } from "./ActionBar";
import { GameControls } from "./GameControls";
import { GameOverModal } from "./GameOverModal";
import { InstallBanner } from "./InstallBanner";
import { LeaderboardModal } from "./LeaderboardModal";
import { Numpad } from "./Numpad";
import { StatusBar, MAX_MISTAKES } from "./StatusBar";
import { SudokuBoard } from "./SudokuBoard";
import { TopBar } from "./TopBar";
import { WinModal } from "./WinModal";
import { playCorrect, playLose, playWin, playWrong } from "@/lib/sudoku/feedback";
import { cloneBoard, createDailyPuzzle, createPuzzle, restartBoard } from "@/lib/sudoku/generator";
import { fillAutoNotes, findHintCell, isSolved, remainingCounts } from "@/lib/sudoku/helpers";
import {
  addScore,
  clearProgress,
  loadBestTimes,
  loadProgress,
  loadStreak,
  recordDailyWin,
  saveBestTime,
  saveProgress,
  todayKey,
  type GameMode,
} from "@/lib/sudoku/storage";
import type { Board, Difficulty, Puzzle } from "@/lib/sudoku/types";

type Selection = { row: number; col: number } | null;

export function SudokuGame() {
  const { settings } = useAppSettings();
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [initialBoard, setInitialBoard] = useState<Board | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [mode, setMode] = useState<GameMode>("normal");
  const [selected, setSelected] = useState<Selection>(null);
  const [notesMode, setNotesMode] = useState(false);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showLostModal, setShowLostModal] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [bestSeconds, setBestSeconds] = useState<number | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [past, setPast] = useState<Board[]>([]);
  const [future, setFuture] = useState<Board[]>([]);
  const [scoresOpen, setScoresOpen] = useState(false);
  const [scoreTick, setScoreTick] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [isPending, startTransition] = useTransition();

  const timerActive = useRef(false);
  const settingsRef = useRef(settings);
  const secondsRef = useRef(0);
  const modeRef = useRef<GameMode>("normal");
  const mistakesRef = useRef(0);
  const finishedRef = useRef(false);
  const boardReadyRef = useRef(false);
  const [bootFailed, setBootFailed] = useState(false);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    mistakesRef.current = mistakes;
  }, [mistakes]);

  const locked = won || lost;

  const refreshBest = useCallback((level: Difficulty) => {
    const best = loadBestTimes()[level];
    setBestSeconds(best ?? null);
  }, []);

  const registerWin = useCallback(
    (solvedPuzzle: Puzzle) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      timerActive.current = false;
      clearProgress();

      const elapsed = secondsRef.current;
      const saved = saveBestTime(solvedPuzzle.difficulty, elapsed);
      setIsNewBest(saved === elapsed);
      refreshBest(solvedPuzzle.difficulty);
      addScore({
        difficulty: solvedPuzzle.difficulty,
        seconds: elapsed,
        mistakes: mistakesRef.current,
        mode: modeRef.current,
        date: todayKey(),
      });
      if (modeRef.current === "daily") {
        const nextStreak = recordDailyWin(todayKey());
        setStreak(nextStreak.current);
      }
      setScoreTick((t) => t + 1);
      playWin(settingsRef.current);
      setWon(true);
      setShowWinModal(true);
    },
    [refreshBest],
  );

  const registerLoss = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    timerActive.current = false;
    clearProgress();
    playLose(settingsRef.current);
    setLost(true);
    setShowLostModal(true);
  }, []);

  const applyPuzzle = useCallback(
    (
      next: Puzzle,
      opts?: {
        mode?: GameMode;
        board?: Board;
        mistakes?: number;
        seconds?: number;
        notesMode?: boolean;
      },
    ) => {
      const nextMode = opts?.mode ?? (next.dailyKey ? "daily" : "normal");
      const cloned = cloneBoard(opts?.board ?? next.board);
      finishedRef.current = false;
      boardReadyRef.current = true;
      setBootFailed(false);
      setPuzzle(next);
      setBoard(cloned);
      setInitialBoard(cloneBoard(next.board));
      setDifficulty(next.difficulty);
      setMode(nextMode);
      setSelected(null);
      setNotesMode(opts?.notesMode ?? false);
      setWon(false);
      setLost(false);
      setShowWinModal(false);
      setShowLostModal(false);
      setMistakes(opts?.mistakes ?? 0);
      setSeconds(opts?.seconds ?? 0);
      setIsNewBest(false);
      setPast([]);
      setFuture([]);
      timerActive.current = true;
      refreshBest(next.difficulty);
    },
    [refreshBest],
  );

  const bootGame = useCallback(
    (forceNew = false) => {
      try {
        if (!forceNew) {
          const saved = loadProgress();
          if (saved) {
            applyPuzzle(saved.puzzle, {
              mode: saved.mode,
              board: saved.board,
              mistakes: saved.mistakes,
              seconds: saved.seconds,
              notesMode: saved.notesMode,
            });
            setHydrated(true);
            return;
          }
        }

        clearProgress();
        applyPuzzle(createPuzzle("easy"));
        setHydrated(true);
      } catch {
        clearProgress();
        try {
          applyPuzzle(createPuzzle("easy"));
          setHydrated(true);
        } catch {
          setBootFailed(true);
          setHydrated(true);
        }
      }
    },
    [applyPuzzle],
  );

  const bootGameRef = useRef(bootGame);

  useEffect(() => {
    bootGameRef.current = bootGame;
  }, [bootGame]);

  useEffect(() => {
    const id = window.setTimeout(() => setStreak(loadStreak().current), 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    boardReadyRef.current = false;

    const bootTimer = window.setTimeout(() => {
      if (!cancelled) bootGameRef.current(false);
    }, 0);

    const watchdog = window.setTimeout(() => {
      if (cancelled || boardReadyRef.current) return;
      clearProgress();
      try {
        bootGameRef.current(true);
      } catch {
        setBootFailed(true);
        setHydrated(true);
      }
    }, 2000);

    return () => {
      cancelled = true;
      window.clearTimeout(bootTimer);
      window.clearTimeout(watchdog);
    };
  }, []);

  useEffect(() => {
    if (!hydrated || !board || !puzzle || !initialBoard || locked) return;
    saveProgress({
      version: 1,
      mode,
      dailyKey: puzzle.dailyKey,
      difficulty,
      puzzle,
      board,
      initialBoard,
      mistakes,
      seconds,
      notesMode,
      savedAt: Date.now(),
    });
  }, [hydrated, board, puzzle, initialBoard, locked, mode, difficulty, mistakes, seconds, notesMode]);

  useEffect(() => {
    if (!board || locked || isPending || !timerActive.current) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [board, locked, isPending]);

  const startNewGame = useCallback(
    (level: Difficulty = difficulty, nextMode: GameMode = "normal") => {
      clearProgress();
      startTransition(() => {
        if (nextMode === "daily") {
          applyPuzzle(createDailyPuzzle(level, todayKey()), { mode: "daily" });
        } else {
          applyPuzzle(createPuzzle(level), { mode: "normal" });
        }
      });
    },
    [applyPuzzle, difficulty],
  );

  const handleDifficultyChange = (level: Difficulty) => {
    startNewGame(level, mode);
  };

  const handleRestart = () => {
    if (!initialBoard) return;
    clearProgress();
    finishedRef.current = false;
    setBoard(restartBoard(initialBoard));
    setSelected(null);
    setNotesMode(false);
    setWon(false);
    setLost(false);
    setShowWinModal(false);
    setShowLostModal(false);
    setMistakes(0);
    setSeconds(0);
    setIsNewBest(false);
    setPast([]);
    setFuture([]);
    timerActive.current = true;
    refreshBest(difficulty);
  };

  const pushHistory = useCallback((current: Board) => {
    setPast((p) => [...p, cloneBoard(current)]);
    setFuture([]);
  }, []);

  const commitBoard = useCallback(
    (next: Board, from: Board, currentPuzzle: Puzzle) => {
      pushHistory(from);
      setBoard(next);
      if (isSolved(next, currentPuzzle.solution)) {
        registerWin(currentPuzzle);
      }
    },
    [pushHistory, registerWin],
  );

  const placeValue = useCallback(
    (num: number | null) => {
      if (!board || !selected || !puzzle || locked) return;
      const { row, col } = selected;
      const cell = board[row][col];
      if (cell.given) return;

      const next = cloneBoard(board);
      const target = next[row][col];
      let mistakeAdded = false;
      let feedback: "correct" | "wrong" | null = null;

      if (notesMode && num !== null) {
        target.value = null;
        if (target.notes.includes(num)) {
          target.notes = target.notes.filter((n) => n !== num);
        } else {
          target.notes = [...target.notes, num].sort((a, b) => a - b);
        }
      } else if (num === null) {
        target.value = null;
        target.notes = [];
      } else if (target.value === num) {
        target.value = null;
        target.notes = [];
      } else {
        target.value = num;
        target.notes = [];
        if (num !== puzzle.solution[row][col]) {
          mistakeAdded = true;
          feedback = "wrong";
        } else {
          feedback = "correct";
        }
      }

      commitBoard(next, board, puzzle);

      if (feedback === "correct") playCorrect(settingsRef.current);
      if (feedback === "wrong") playWrong(settingsRef.current);

      if (mistakeAdded) {
        setMistakes((m) => {
          const nextMistakes = m + 1;
          mistakesRef.current = nextMistakes;
          if (nextMistakes >= MAX_MISTAKES) {
            registerLoss();
          }
          return nextMistakes;
        });
      }
    },
    [board, selected, puzzle, locked, notesMode, commitBoard, registerLoss],
  );

  const handleUndo = useCallback(() => {
    if (!board || past.length === 0 || locked) return;
    const previous = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [cloneBoard(board), ...f]);
    setBoard(cloneBoard(previous));
  }, [board, past, locked]);

  const handleRedo = useCallback(() => {
    if (!board || !puzzle || future.length === 0 || locked) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setPast((p) => [...p, cloneBoard(board)]);
    setBoard(cloneBoard(next));
    if (isSolved(next, puzzle.solution)) {
      registerWin(puzzle);
    }
  }, [board, future, locked, puzzle, registerWin]);

  const handleHint = useCallback(() => {
    if (!board || !puzzle || locked) return;
    const cell = findHintCell(board, puzzle.solution, selected);
    if (!cell) return;

    const next = cloneBoard(board);
    next[cell.row][cell.col].value = puzzle.solution[cell.row][cell.col];
    next[cell.row][cell.col].notes = [];
    commitBoard(next, board, puzzle);
    setSelected(cell);
    playCorrect(settingsRef.current);
  }, [board, puzzle, locked, selected, commitBoard]);

  const handleAutoNotes = useCallback(() => {
    if (!board || !puzzle || locked) return;
    commitBoard(fillAutoNotes(board), board, puzzle);
  }, [board, puzzle, locked, commitBoard]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!board) return;

      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
        return;
      }
      if (meta && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
        return;
      }

      if (locked) return;

      if (e.key.toLowerCase() === "h") {
        e.preventDefault();
        handleHint();
        return;
      }

      if (e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        placeValue(Number(e.key));
        return;
      }

      if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        e.preventDefault();
        placeValue(null);
        return;
      }

      if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        setNotesMode((v) => !v);
        return;
      }

      if (!selected) return;

      const moves: Record<string, [number, number]> = {
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0],
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1],
      };

      const delta = moves[e.key];
      if (!delta) return;

      e.preventDefault();
      const [dr, dc] = delta;
      setSelected({
        row: Math.min(8, Math.max(0, selected.row + dr)),
        col: Math.min(8, Math.max(0, selected.col + dc)),
      });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [board, locked, placeValue, selected, handleUndo, handleRedo, handleHint]);

  const remaining = board ? remainingCounts(board) : Array(9).fill(9);
  const controlsDisabled = !board || isPending || locked;

  return (
    <div className="sudoku-shell relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at top, var(--shell-a) 0%, transparent 52%), radial-gradient(ellipse at bottom right, var(--shell-b) 0%, transparent 48%), linear-gradient(180deg, var(--shell-c) 0%, var(--shell-d) 100%)",
        }}
      />

      <div className="relative mx-auto flex h-full w-full max-w-lg flex-col">
        <header className="app-pad-x app-pad-top shrink-0 space-y-2 pb-1.5 pt-1.5 sm:space-y-3 sm:pt-6">
          <TopBar
            isDaily={mode === "daily"}
            onDaily={() => startNewGame(difficulty, mode === "daily" ? "normal" : "daily")}
            onOpenScores={() => setScoresOpen(true)}
          />
          <GameControls
            difficulty={difficulty}
            generating={isPending || !board}
            onDifficultyChange={handleDifficultyChange}
            onNewGame={() => startNewGame(difficulty, mode)}
            onRestart={handleRestart}
          />
          <StatusBar seconds={seconds} bestSeconds={bestSeconds} mistakes={mistakes} streak={streak} />
          {mode === "daily" && (
            <p className="px-0.5 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-700/80 dark:text-teal-300/80">
              Günlük · {todayKey()}
            </p>
          )}
        </header>

        <section className="app-pad-x flex min-h-0 flex-1 items-center justify-center py-1 sm:py-4">
          {board ? (
            <SudokuBoard
              board={board}
              selected={selected}
              onSelect={(row, col) => {
                if (!locked) setSelected({ row, col });
              }}
            />
          ) : (
            <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-[1.15rem] bg-white/70 ring-1 ring-slate-200 dark:bg-slate-800/70 dark:ring-slate-700">
              {!bootFailed && (
                <span className="size-8 animate-spin rounded-full border-[3px] border-teal-200 border-t-teal-600 dark:border-teal-900 dark:border-t-teal-300" />
              )}
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {bootFailed ? "Bulmaca yüklenemedi" : "Bulmaca hazırlanıyor…"}
              </p>
              {bootFailed && (
                <button
                  type="button"
                  onClick={() => {
                    setBootFailed(false);
                    bootGame(true);
                  }}
                  className="rounded-2xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white active:scale-95"
                >
                  Tekrar dene
                </button>
              )}
            </div>
          )}
        </section>

        <footer className="app-pad-x app-pad-bottom app-dock shrink-0 space-y-1.5 border-t px-3 pt-2 sm:space-y-2 sm:rounded-t-3xl sm:border sm:px-4 sm:pb-5 sm:pt-3">
          <ActionBar
            disabled={controlsDisabled}
            canUndo={past.length > 0}
            canRedo={future.length > 0}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onHint={handleHint}
            onAutoNotes={handleAutoNotes}
          />
          <Numpad
            notesMode={notesMode}
            remaining={remaining}
            disabled={controlsDisabled}
            onNumber={(n) => placeValue(n)}
            onErase={() => placeValue(null)}
            onToggleNotes={() => setNotesMode((v) => !v)}
          />
        </footer>
      </div>

      <InstallBanner />

      <WinModal
        key={scoreTick}
        open={showWinModal}
        difficulty={puzzle?.difficulty ?? difficulty}
        seconds={seconds}
        mistakes={mistakes}
        mode={mode}
        streak={streak}
        isNewBest={isNewBest}
        onNewGame={() => startNewGame(difficulty, mode)}
        onClose={() => setShowWinModal(false)}
      />

      <GameOverModal
        open={showLostModal}
        onNewGame={() => startNewGame(difficulty, mode)}
        onRestart={() => {
          handleRestart();
        }}
        onClose={() => setShowLostModal(false)}
      />

      <LeaderboardModal open={scoresOpen} onClose={() => setScoresOpen(false)} refreshKey={scoreTick} />
    </div>
  );
}
