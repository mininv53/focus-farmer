import { describe, expect, it } from 'vitest';
import { newlyEarnedStreakBadges, updateStreak } from '@/lib/stats/streak';
import type { StreakState } from '@/lib/persistence/schema';

const day = (n: number) => new Date(2025, 0, n, 12).getTime();

describe('streak', () => {
  it('starts at 1 from idle', () => {
    const s: StreakState = { current: 0, longest: 0, lastActiveDay: null };
    const next = updateStreak(s, day(1));
    expect(next.current).toBe(1);
    expect(next.longest).toBe(1);
  });

  it('increments on consecutive days', () => {
    let s: StreakState = { current: 0, longest: 0, lastActiveDay: null };
    s = updateStreak(s, day(1));
    s = updateStreak(s, day(2));
    s = updateStreak(s, day(3));
    expect(s.current).toBe(3);
    expect(s.longest).toBe(3);
  });

  it('does not double-count multiple sessions in same day', () => {
    let s: StreakState = { current: 0, longest: 0, lastActiveDay: null };
    s = updateStreak(s, day(1));
    s = updateStreak(s, day(1) + 5_000);
    expect(s.current).toBe(1);
  });

  it('resets to 1 after a missed day but keeps longest', () => {
    let s: StreakState = { current: 0, longest: 0, lastActiveDay: null };
    s = updateStreak(s, day(1));
    s = updateStreak(s, day(2));
    s = updateStreak(s, day(3));
    s = updateStreak(s, day(5));
    expect(s.current).toBe(1);
    expect(s.longest).toBe(3);
  });

  it('awards 7-day badge once', () => {
    const state: StreakState = { current: 7, longest: 7, lastActiveDay: '2025-01-07' };
    const earned = newlyEarnedStreakBadges(state, [], day(7));
    expect(earned.find((b) => b.id === '7-day-streak')).toBeTruthy();
    const earnedAgain = newlyEarnedStreakBadges(state, earned, day(7));
    expect(earnedAgain.find((b) => b.id === '7-day-streak')).toBeFalsy();
  });

  it('awards higher badges as streak grows', () => {
    const state: StreakState = { current: 100, longest: 100, lastActiveDay: '2025-04-10' };
    const earned = newlyEarnedStreakBadges(state, [], day(100));
    const ids = earned.map((b) => b.id);
    expect(ids).toContain('7-day-streak');
    expect(ids).toContain('30-day-streak');
    expect(ids).toContain('100-day-streak');
  });
});
