'use client';

import { create } from 'zustand';
import {
  TimerState,
  abortTimer,
  initialTimerState,
  pauseTimer,
  resumeTimer,
  startTimer,
  completeTimer,
} from '@/lib/focus/timer';

const TIMER_KEY = 'focus-realm:timer:v1';

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

function load(): TimerState {
  if (!isBrowser) return initialTimerState;
  try {
    const raw = window.localStorage.getItem(TIMER_KEY);
    if (!raw) return initialTimerState;
    return JSON.parse(raw) as TimerState;
  } catch {
    return initialTimerState;
  }
}

function save(state: TimerState) {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(TIMER_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

interface TimerStore {
  timer: TimerState;
  hydrated: boolean;
  hydrate: () => void;
  start: (durationSec: number) => void;
  pause: () => void;
  resume: () => void;
  abort: () => void;
  markCompleted: () => void;
  reset: () => void;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  timer: initialTimerState,
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    set({ timer: load(), hydrated: true });
  },
  start: (durationSec) => {
    const next = startTimer(durationSec, Date.now());
    save(next);
    set({ timer: next });
  },
  pause: () => {
    const next = pauseTimer(get().timer, Date.now());
    save(next);
    set({ timer: next });
  },
  resume: () => {
    const next = resumeTimer(get().timer, Date.now());
    save(next);
    set({ timer: next });
  },
  abort: () => {
    const next = abortTimer(get().timer, Date.now());
    save(next);
    set({ timer: next });
  },
  markCompleted: () => {
    const next = completeTimer(get().timer);
    save(next);
    set({ timer: next });
  },
  reset: () => {
    save(initialTimerState);
    set({ timer: initialTimerState });
  },
}));
