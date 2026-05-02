import { describe, expect, it } from 'vitest';
import {
  abortTimer,
  completeTimer,
  elapsedSec,
  formatMMSS,
  initialTimerState,
  isExpired,
  pauseTimer,
  remainingSec,
  resumeTimer,
  startTimer,
} from '@/lib/focus/timer';

const T0 = 1_700_000_000_000;

describe('timer', () => {
  it('starts running and tracks elapsed via wall clock', () => {
    const s = startTimer(60, T0);
    expect(s.status).toBe('running');
    expect(elapsedSec(s, T0 + 10_000)).toBeCloseTo(10, 1);
    expect(remainingSec(s, T0 + 10_000)).toBeCloseTo(50, 1);
  });

  it('pause + resume preserves accumulated focus', () => {
    let s = startTimer(60, T0);
    s = pauseTimer(s, T0 + 5_000);
    expect(s.status).toBe('paused');
    expect(elapsedSec(s, T0 + 30_000)).toBeCloseTo(5, 1);
    s = resumeTimer(s, T0 + 30_000);
    expect(elapsedSec(s, T0 + 35_000)).toBeCloseTo(10, 1);
  });

  it('abort stops accumulating', () => {
    let s = startTimer(30, T0);
    s = abortTimer(s, T0 + 7_000);
    expect(s.status).toBe('aborted');
    expect(elapsedSec(s, T0 + 9_999_999)).toBeCloseTo(7, 1);
  });

  it('isExpired flips after duration elapsed', () => {
    const s = startTimer(10, T0);
    expect(isExpired(s, T0 + 9_999)).toBe(false);
    expect(isExpired(s, T0 + 10_000)).toBe(true);
    expect(isExpired(s, T0 + 30_000)).toBe(true);
  });

  it('completeTimer pins elapsed to duration', () => {
    let s = startTimer(20, T0);
    s = pauseTimer(s, T0 + 12_000);
    s = completeTimer(s);
    expect(s.status).toBe('completed');
    expect(s.accumulatedSec).toBe(20);
  });

  it('initial state is idle and zero', () => {
    expect(initialTimerState.status).toBe('idle');
    expect(remainingSec(initialTimerState, T0)).toBe(0);
  });

  it('formatMMSS pads', () => {
    expect(formatMMSS(0)).toBe('00:00');
    expect(formatMMSS(65)).toBe('01:05');
    expect(formatMMSS(1500)).toBe('25:00');
    expect(formatMMSS(-3)).toBe('00:00');
  });
});
