import { describe, expect, it } from 'vitest';
import { bucketByDay, lastNDays, summarize, dayKey } from '@/lib/stats/aggregates';
import type { SessionRecord } from '@/lib/persistence/schema';

const day = (n: number) => new Date(2025, 0, n, 14).getTime();

const session = (start: number, dur = 1500, focused = 1500, completed = true): SessionRecord => ({
  id: `s_${start}`,
  startedAt: start,
  durationSec: dur,
  focusedSec: focused,
  completed,
});

describe('aggregates', () => {
  it('dayKey yields a stable YYYY-MM-DD string', () => {
    const k = dayKey(day(5));
    expect(k).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('bucketByDay groups completed sessions only', () => {
    const sessions = [
      session(day(1)),
      session(day(1) + 10_000),
      session(day(2)),
      session(day(2), 600, 300, false), // aborted, not counted
    ];
    const buckets = bucketByDay(sessions);
    const v1 = buckets.get(dayKey(day(1)))!;
    const v2 = buckets.get(dayKey(day(2)))!;
    expect(v1.sessions).toBe(2);
    expect(v2.sessions).toBe(1);
  });

  it('summarize computes average and totals', () => {
    const sessions = [session(day(1), 600, 600), session(day(2), 1500, 1500)];
    const s = summarize(sessions);
    expect(s.totalSessions).toBe(2);
    expect(s.totalFocusMinutes).toBeCloseTo(35, 1);
    expect(s.avgSessionMinutes).toBeCloseTo(17.5, 1);
  });

  it('lastNDays returns N keys ending with today', () => {
    const today = new Date(2025, 0, 10, 14);
    const days = lastNDays(3, today);
    expect(days).toEqual(['2025-01-08', '2025-01-09', '2025-01-10']);
  });
});
