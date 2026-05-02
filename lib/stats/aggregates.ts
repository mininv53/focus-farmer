import { SessionRecord } from '@/lib/persistence/schema';

export interface DayBucket {
  /** YYYY-MM-DD in user's local time. */
  date: string;
  sessions: number;
  focusedMinutes: number;
}

export function dayKey(
  epochMs: number,
  tzOffsetMin: number = new Date().getTimezoneOffset(),
): string {
  const local = new Date(epochMs - tzOffsetMin * 60 * 1000);
  const y = local.getUTCFullYear();
  const m = (local.getUTCMonth() + 1).toString().padStart(2, '0');
  const d = local.getUTCDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function bucketByDay(sessions: SessionRecord[]): Map<string, DayBucket> {
  const map = new Map<string, DayBucket>();
  for (const s of sessions) {
    if (!s.completed) continue;
    const k = dayKey(s.startedAt);
    const cur = map.get(k) ?? { date: k, sessions: 0, focusedMinutes: 0 };
    cur.sessions += 1;
    cur.focusedMinutes += s.focusedSec / 60;
    map.set(k, cur);
  }
  return map;
}

export interface RangeSummary {
  totalSessions: number;
  totalFocusMinutes: number;
  avgSessionMinutes: number;
}

export function summarize(sessions: SessionRecord[]): RangeSummary {
  const completed = sessions.filter((s) => s.completed);
  const totalFocus = completed.reduce((acc, s) => acc + s.focusedSec / 60, 0);
  return {
    totalSessions: completed.length,
    totalFocusMinutes: totalFocus,
    avgSessionMinutes: completed.length ? totalFocus / completed.length : 0,
  };
}

export function lastNDays(n: number, today = new Date()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    out.push(dayKey(d.getTime()));
  }
  return out;
}

export function todaySessions(sessions: SessionRecord[]): SessionRecord[] {
  const today = dayKey(Date.now());
  return sessions.filter((s) => s.completed && dayKey(s.startedAt) === today);
}

export function thisWeekSessions(sessions: SessionRecord[]): SessionRecord[] {
  const days = new Set(lastNDays(7));
  return sessions.filter((s) => s.completed && days.has(dayKey(s.startedAt)));
}
