'use client';

import { useEffect } from 'react';
import { Topbar } from '@/components/nav/topbar';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { FocusChart } from '@/components/stats/focus-chart';
import { StreakBadges } from '@/components/stats/streak-badges';
import { useGardenStore } from '@/lib/store/garden-store';
import { bucketByDay, summarize, thisWeekSessions, todaySessions } from '@/lib/stats/aggregates';

export default function StatsPage() {
  const hydrate = useGardenStore((s) => s.hydrate);
  const sessions = useGardenStore((s) => s.sessions);
  const streak = useGardenStore((s) => s.streak);
  const badges = useGardenStore((s) => s.badges);
  const inventory = useGardenStore((s) => s.inventory);
  const planted = useGardenStore((s) => s.plantedCrops);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const today = summarize(todaySessions(sessions));
  const week = summarize(thisWeekSessions(sessions));
  const lifetime = summarize(sessions);
  const bestDay = bestDayFromBuckets(sessions);
  const totalHarvested = inventory.reduce((sum, e) => sum + e.count, 0);

  return (
    <>
      <Topbar />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight text-garden-loam dark:text-garden-cream">
            your stats
          </h1>
          <p className="mt-1 text-sm text-garden-loam/70 dark:text-garden-cream/70">
            Just numbers. No leaderboards. No comparison shaming.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatBlock
            title="today"
            primary={`${Math.round(today.totalFocusMinutes)} min`}
            sub={`${today.totalSessions} session${today.totalSessions === 1 ? '' : 's'}`}
          />
          <StatBlock
            title="this week"
            primary={`${Math.round(week.totalFocusMinutes)} min`}
            sub={`${week.totalSessions} sessions · avg ${Math.round(week.avgSessionMinutes)} min`}
          />
          <StatBlock
            title="all time"
            primary={`${Math.round(lifetime.totalFocusMinutes)} min`}
            sub={`${lifetime.totalSessions} sessions · ${totalHarvested} harvested · ${planted.length} growing`}
          />
        </div>

        <Card>
          <CardTitle>last 7 days</CardTitle>
          <CardDescription>focused minutes per day</CardDescription>
          <div className="mt-4">
            <FocusChart sessions={sessions} days={7} />
          </div>
        </Card>

        <Card>
          <CardTitle>streak</CardTitle>
          <CardDescription>
            current {streak.current} day{streak.current === 1 ? '' : 's'} · longest {streak.longest}{' '}
            day{streak.longest === 1 ? '' : 's'}
          </CardDescription>
          <div className="mt-4">
            <StreakBadges badges={badges} />
          </div>
        </Card>

        {bestDay && (
          <Card>
            <CardTitle>best day so far</CardTitle>
            <CardDescription>
              On <strong>{bestDay.date}</strong> you focused for{' '}
              <strong>{Math.round(bestDay.focusedMinutes)} min</strong> across {bestDay.sessions}{' '}
              session{bestDay.sessions === 1 ? '' : 's'}.
            </CardDescription>
          </Card>
        )}
      </main>
    </>
  );
}

function StatBlock({ title, primary, sub }: { title: string; primary: string; sub: string }) {
  return (
    <Card>
      <div className="text-xs uppercase tracking-widest text-garden-loam/60 dark:text-garden-cream/60">
        {title}
      </div>
      <div className="mt-2 font-mono text-3xl font-semibold tabular-nums text-garden-loam dark:text-garden-cream">
        {primary}
      </div>
      <div className="mt-1 text-xs text-garden-loam/60 dark:text-garden-cream/60">{sub}</div>
    </Card>
  );
}

function bestDayFromBuckets(sessions: ReturnType<typeof useGardenStore.getState>['sessions']) {
  const buckets = Array.from(bucketByDay(sessions).values());
  if (!buckets.length) return null;
  return buckets.reduce((a, b) => (b.focusedMinutes > a.focusedMinutes ? b : a));
}
