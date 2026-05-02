import { BadgeUnlock, StreakState } from '@/lib/persistence/schema';
import { dayKey } from './aggregates';

/**
 * Update streak based on a newly completed session timestamp.
 * Streaks are POSITIVE-ONLY: missing a day resets the count to 1 (the current day),
 * but already-earned badges in the badges array are never removed.
 */
export function updateStreak(state: StreakState, now: number): StreakState {
  const today = dayKey(now);
  if (state.lastActiveDay === today) return state;

  const yesterday = dayKey(now - 24 * 60 * 60 * 1000);
  const next = state.lastActiveDay === yesterday ? state.current + 1 : 1;
  return {
    current: next,
    longest: Math.max(state.longest, next),
    lastActiveDay: today,
  };
}

const STREAK_BADGES: { id: BadgeUnlock['id']; threshold: number }[] = [
  { id: '7-day-streak', threshold: 7 },
  { id: '30-day-streak', threshold: 30 },
  { id: '100-day-streak', threshold: 100 },
];

export function newlyEarnedStreakBadges(
  current: StreakState,
  existing: BadgeUnlock[],
  now: number,
): BadgeUnlock[] {
  const have = new Set(existing.map((b) => b.id));
  const out: BadgeUnlock[] = [];
  for (const b of STREAK_BADGES) {
    if (current.current >= b.threshold && !have.has(b.id)) {
      out.push({ id: b.id, unlockedAt: now });
    }
  }
  return out;
}
