"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useAppSettings } from "@/components/ThemeProvider";
import { ActionBar } from "./ActionBar";
import { GameControls } from "./GameControls";
import { GameOverModal } from "./GameOverModal";
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
  const [hydrated, setHydrated] = useState(false);
  const [isPending, startTransition] = useTransition();

  const timerActive = useRef(false);
  const settingsRef = useRef(settings);
  const secondsRef = useRef(0);
  const modeRef = useRef<GameMode>("normal");
  const mistakesRef = useRef(0);
  const finishedRef = useRef(false);
  const applyPuzzleRef = useRef<(
    next: Puzzle,
    opts?: {
      mode?: GameMode;
      board?: Board;
      mistakes?: number;
      seconds?: number;
      notesMode?: boolean;
    },
  ) => void>(() => {});

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

  useEffect(() => {
    applyPuzzleRef.current = applyPuzzle;
  }, [applyPuzzle]);

  useEffect(() => {
    let alive = true;
    const saved = loadProgress();
    const timer = window.setTimeout(() => {
      if (!alive) return;
      try {
        const validSaved =
          saved &&
          Array.isArray(saved.puzzle?.board) &&
          Array.isArray(saved.puzzle?.solution) &&
          Array.isArray(saved.board);

        if (validSaved) {
          applyPuzzleRef.current(saved.puzzle, {
            mode: saved.mode,
            board: saved.board,
            mistakes: saved.mistakes,
            seconds: saved.seconds,
            notesMode: saved.notesMode,
          });
        } else {
          if (saved) clearProgress();
          applyPuzzleRef.current(createPuzzle("easy"));
        }
      } catch {
        clearProgress();
        applyPuzzleRef.current(createPuzzle("easy"));
      }
      if (alive) setHydrated(true);
    }, 0);

    return () => {
      alive = false;
      window.clearTimeout(timer);
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
    <div className="sudoku-shell relative min-h-dvh overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at top, var(--shell-a) 0%, transparent 55%), radial-gradient(ellipse at bottom right, var(--shell-b) 0%, transparent 50%), linear-gradient(180deg, var(--shell-c) 0%, var(--shell-d) 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2] [background-image:linear-gradient(rgba(15,118,110,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,118,110,0.06)_1px,transparent_1px)] [background-size:24px_24px]"
      />

      <main className="relative mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-6 sm:gap-5 sm:py-10">
        <header className="text-center">
          <p className="font-display text-3xl font-semibold tracking-tight text-teal-800 dark:text-teal-300 sm:text-4xl">
            Sudoku
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {mode === "daily" ? `Günlük bulmaca · ${todayKey()}` : "Hücre seç · 1–9 · N not · H ipucu"}
          </p>
        </header>

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

        <StatusBar seconds={seconds} bestSeconds={bestSeconds} mistakes={mistakes} />

        {board ? (
          <SudokuBoard
            board={board}
            selected={selected}
            onSelect={(row, col) => {
              if (!locked) setSelected({ row, col });
            }}
          />
        ) : (
          <div className="mx-auto flex aspect-square w-full max-w-[min(100%,28rem)] items-center justify-center rounded-xl bg-white/70 ring-1 ring-slate-200 dark:bg-slate-800/70 dark:ring-slate-700">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Bulmaca hazırlanıyor…</p>
          </div>
        )}

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
      </main>

      <WinModal
        open={showWinModal}
        difficulty={puzzle?.difficulty ?? difficulty}
        seconds={seconds}
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
