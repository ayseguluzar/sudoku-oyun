import type { AppSettings } from "./storage";

let audioCtx: AudioContext | null = null;

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!audioCtx) audioCtx = new AC();
  return audioCtx;
}

function tone(freq: number, duration: number, type: OscillatorType, gain = 0.04) {
  const ac = ctx();
  if (!ac) return;
  if (ac.state === "suspended") void ac.resume();

  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration);
}

export function playCorrect(settings: AppSettings) {
  if (settings.sound) {
    tone(660, 0.08, "sine", 0.05);
    setTimeout(() => tone(880, 0.1, "sine", 0.04), 70);
  }
  if (settings.vibrate && navigator.vibrate) navigator.vibrate(12);
}

export function playWrong(settings: AppSettings) {
  if (settings.sound) {
    tone(220, 0.16, "square", 0.035);
  }
  if (settings.vibrate && navigator.vibrate) navigator.vibrate([30, 40, 30]);
}

export function playWin(settings: AppSettings) {
  if (settings.sound) {
    tone(523, 0.1, "sine", 0.05);
    setTimeout(() => tone(659, 0.1, "sine", 0.05), 100);
    setTimeout(() => tone(784, 0.18, "sine", 0.055), 200);
  }
  if (settings.vibrate && navigator.vibrate) navigator.vibrate([20, 30, 20, 30, 40]);
}

export function playLose(settings: AppSettings) {
  if (settings.sound) {
    tone(300, 0.12, "sawtooth", 0.03);
    setTimeout(() => tone(180, 0.2, "sawtooth", 0.03), 120);
  }
  if (settings.vibrate && navigator.vibrate) navigator.vibrate([60, 40, 80]);
}
