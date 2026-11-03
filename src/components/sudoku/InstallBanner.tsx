"use client";

import { useEffect, useState } from "react";
import { Share, X } from "lucide-react";

function isStandalone() {
  if (typeof window === "undefined") return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || Boolean(nav.standalone);
}

function isIos() {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function InstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isStandalone() || !isIos()) return;
    const dismissed = window.sessionStorage.getItem("sudoku-install-dismissed");
    if (dismissed) return;
    const id = window.setTimeout(() => setShow(true), 1200);
    return () => window.clearTimeout(id);
  }, []);

  if (!show) return null;

  return (
    <div className="app-pad-x pointer-events-none absolute inset-x-0 bottom-0 z-40 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto mx-auto mb-2 flex max-w-lg items-start gap-3 rounded-2xl bg-slate-900/95 px-3.5 py-3 text-white shadow-xl ring-1 ring-white/10 backdrop-blur-md dark:bg-slate-800/95">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-teal-500">
          <Share className="size-4" />
        </div>
        <div className="min-w-0 flex-1 text-sm leading-snug">
          <p className="font-semibold">Ana ekrana ekle</p>
          <p className="mt-0.5 text-xs text-slate-300">
            Safari’de Paylaş → <span className="font-semibold text-white">Ana Ekrana Ekle</span>
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Kapat"
          onClick={() => {
            window.sessionStorage.setItem("sudoku-install-dismissed", "1");
            setShow(false);
          }}
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
