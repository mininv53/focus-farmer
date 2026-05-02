/**
 * Robust timer state machine that survives tab switches.
 *
 * It does NOT use setInterval ticks for accuracy. Instead it stores the
 * absolute startedAt epoch ms and computes remaining based on Date.now()
 * on every read. UI can poll with rAF/setInterval for redraw — accuracy
 * is anchored to the wall clock.
 */

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed' | 'aborted';

export interface TimerState {
  status: TimerStatus;
  durationSec: number;
  /** Epoch ms of the latest start/resume. Null when idle/completed/aborted. */
  startedAt: number | null;
  /** Accumulated focused seconds across previous resumes. */
  accumulatedSec: number;
}

export const initialTimerState: TimerState = {
  status: 'idle',
  durationSec: 0,
  startedAt: null,
  accumulatedSec: 0,
};

export function startTimer(durationSec: number, now: number): TimerState {
  return { status: 'running', durationSec, startedAt: now, accumulatedSec: 0 };
}

export function pauseTimer(state: TimerState, now: number): TimerState {
  if (state.status !== 'running' || state.startedAt === null) return state;
  const segment = Math.max(0, (now - state.startedAt) / 1000);
  return {
    ...state,
    status: 'paused',
    startedAt: null,
    accumulatedSec: state.accumulatedSec + segment,
  };
}

export function resumeTimer(state: TimerState, now: number): TimerState {
  if (state.status !== 'paused') return state;
  return { ...state, status: 'running', startedAt: now };
}

export function abortTimer(state: TimerState, now: number): TimerState {
  if (state.status === 'idle') return state;
  const segment = state.startedAt ? Math.max(0, (now - state.startedAt) / 1000) : 0;
  return {
    status: 'aborted',
    durationSec: state.durationSec,
    startedAt: null,
    accumulatedSec: state.accumulatedSec + segment,
  };
}

/**
 * Returns the live elapsed seconds across all running/paused segments.
 */
export function elapsedSec(state: TimerState, now: number): number {
  if (state.status === 'running' && state.startedAt !== null) {
    return state.accumulatedSec + Math.max(0, (now - state.startedAt) / 1000);
  }
  return state.accumulatedSec;
}

export function remainingSec(state: TimerState, now: number): number {
  return Math.max(0, state.durationSec - elapsedSec(state, now));
}

export function isExpired(state: TimerState, now: number): boolean {
  return state.status !== 'idle' && elapsedSec(state, now) >= state.durationSec;
}

export function completeTimer(state: TimerState): TimerState {
  return {
    status: 'completed',
    durationSec: state.durationSec,
    startedAt: null,
    accumulatedSec: state.durationSec,
  };
}

export function resetTimer(): TimerState {
  return initialTimerState;
}

export function formatMMSS(sec: number): string {
  const safe = Math.max(0, Math.floor(sec));
  const m = Math.floor(safe / 60)
    .toString()
    .padStart(2, '0');
  const s = (safe % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
