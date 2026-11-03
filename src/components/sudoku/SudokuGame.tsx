"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { GameControls } from "./GameControls";
import { Numpad } from "./Numpad";
import { SudokuBoard } from "./SudokuBoard";
import { WinModal } from "./WinModal";
import { cloneBoard, createPuzzle, restartBoard } from "@/lib/sudoku/generator";
import { isBoardComplete } from "@/lib/sudoku/validator";
import type { Board, Difficulty, Puzzle } from "@/lib/sudoku/types";

type Selection = { row: number; col: number } | null;

function initialPuzzle(): Puzzle {
  return createPuzzle("easy");
}

export function SudokuGame() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [initialBoard, setInitialBoard] = useState<Board | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [selected, setSelected] = useState<Selection>(null);
  const [notesMode, setNotesMode] = useState(false);
  const [won, setWon] = useState(false);
  const [isPending, startTransition] = useTransition();

  const applyPuzzle = useCallback((next: Puzzle) => {
    const cloned = cloneBoard(next.board);
    setPuzzle(next);
    setBoard(cloned);
    setInitialBoard(cloneBoard(next.board));
    setDifficulty(next.difficulty);
    setSelected(null);
    setNotesMode(false);
    setWon(false);
  }, []);

  useEffect(() => {
    startTransition(() => {
      applyPuzzle(initialPuzzle());
    });
  }, [applyPuzzle]);

  const startNewGame = useCallback(
    (level: Difficulty = difficulty) => {
      startTransition(() => {
        applyPuzzle(createPuzzle(level));
      });
    },
    [applyPuzzle, difficulty],
  );

  const handleDifficultyChange = (level: Difficulty) => {
    setDifficulty(level);
    startNewGame(level);
  };

  const handleRestart = () => {
    if (!initialBoard) return;
    setBoard(restartBoard(initialBoard));
    setSelected(null);
    setWon(false);
  };

  useEffect(() => {
    if (board && !won && isBoardComplete(board)) {
      setWon(true);
    }
  }, [board, won]);

  const placeValue = useCallback(
    (num: number | null) => {
      if (!board || !selected || won) return;
      const { row, col } = selected;
      const cell = board[row][col];
      if (cell.given) return;

      setBoard((prev) => {
        if (!prev) return prev;
        const next = cloneBoard(prev);
        const target = next[row][col];

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
        } else {
          target.value = target.value === num ? null : num;
          target.notes = [];
        }

        return next;
      });
    },
    [board, notesMode, selected, won],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!board) return;

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
  }, [board, placeValue, selected]);

  return (
    <div className="sudoku-shell relative min-h-dvh overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#ccfbf1_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_right,_#e0f2fe_0%,_transparent_50%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(15,118,110,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,118,110,0.06)_1px,transparent_1px)] [background-size:24px_24px]"
      />

      <main className="relative mx-auto flex w-full max-w-lg flex-col gap-5 px-4 py-6 sm:py-10">
        <header className="text-center">
          <p className="font-display text-3xl font-semibold tracking-tight text-teal-800 sm:text-4xl">
            Sudoku
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Hücre seç · 1–9 yaz · N ile not modu
          </p>
        </header>

        <GameControls
          difficulty={difficulty}
          generating={isPending || !board}
          onDifficultyChange={handleDifficultyChange}
          onNewGame={() => startNewGame()}
          onRestart={handleRestart}
        />

        {board ? (
          <SudokuBoard board={board} selected={selected} onSelect={(row, col) => setSelected({ row, col })} />
        ) : (
          <div className="mx-auto flex aspect-square w-full max-w-[min(100%,28rem)] items-center justify-center rounded-xl bg-white/70 ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500">Bulmaca hazırlanıyor…</p>
          </div>
        )}

        <Numpad
          notesMode={notesMode}
          disabled={!board || isPending}
          onNumber={(n) => placeValue(n)}
          onErase={() => placeValue(null)}
          onToggleNotes={() => setNotesMode((v) => !v)}
        />
      </main>

      <WinModal
        open={won}
        difficulty={puzzle?.difficulty ?? difficulty}
        onNewGame={() => startNewGame()}
        onClose={() => setWon(false)}
      />
    </div>
  );
}
