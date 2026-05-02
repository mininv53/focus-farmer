/**
 * Tiny browser-only audio synthesizer used for SFX when no audio assets are
 * provided. If `/audio/<name>.mp3` exists in /public, the React UI can load
 * it directly with `new Audio()`; this module is a synthesised fallback.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (ctx) return ctx;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  return ctx;
}

interface BlipOpts {
  freq: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
}

function blip({ freq, duration, type = 'sine', volume = 0.15 }: BlipOpts) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = 0;
  gain.gain.linearRampToValueAtTime(volume, c.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration + 0.05);
}

export const sfx = {
  start() {
    blip({ freq: 440, duration: 0.12, type: 'triangle' });
    setTimeout(() => blip({ freq: 660, duration: 0.18, type: 'triangle' }), 90);
  },
  complete() {
    blip({ freq: 523, duration: 0.16, type: 'sine' });
    setTimeout(() => blip({ freq: 659, duration: 0.16, type: 'sine' }), 130);
    setTimeout(() => blip({ freq: 784, duration: 0.28, type: 'sine' }), 280);
  },
  summon() {
    blip({ freq: 880, duration: 0.22, type: 'sine', volume: 0.12 });
  },
  click() {
    blip({ freq: 320, duration: 0.05, type: 'square', volume: 0.06 });
  },
};
