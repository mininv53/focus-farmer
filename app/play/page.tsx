'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Topbar } from '@/components/nav/topbar';
import { AgeGate } from '@/components/age-gate/age-gate';
import { TimerControls } from '@/components/timer/timer-controls';
import { TimerOverlay } from '@/components/timer/timer-overlay';
import { useTimerEngine } from '@/components/timer/use-timer-engine';
import { useRealmStore } from '@/lib/store/realm-store';
import { useTimerStore } from '@/lib/store/timer-store';
import { formatResourceGain } from '@/lib/spirits/idle';

const RealmCanvas = dynamic(
  () => import('@/components/realm/realm-canvas').then((m) => m.RealmCanvas),
  {
    ssr: false,
    loading: () => <div className="aspect-[7/4] animate-pulse rounded-2xl bg-realm-ink/10" />,
  },
);

interface ToastState {
  id: number;
  text: string;
  flavour?: string;
}

export default function PlayPage() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [idleSummary, setIdleSummary] = useState<string | null>(null);

  const hydrate = useRealmStore((s) => s.hydrate);
  const hydrateTimer = useTimerStore((s) => s.hydrate);
  const collectIdle = useRealmStore((s) => s.collectIdle);
  const resources = useRealmStore((s) => s.resources);
  const spiritCount = useRealmStore((s) => s.spirits.length);
  const streak = useRealmStore((s) => s.streak.current);

  useEffect(() => {
    hydrate();
    hydrateTimer();
  }, [hydrate, hydrateTimer]);

  useEffect(() => {
    const gained = collectIdle();
    if (gained.motes >= 1 || gained.ore >= 1 || gained.herbs >= 1) {
      setIdleSummary(`while you were away your spirits gathered ${formatResourceGain(gained)}.`);
    }
  }, [collectIdle]);

  useTimerEngine({
    onSummon: (e) => {
      const rarityWord =
        e.rarity === 'legendary' ? '🌌 LEGENDARY' : e.rarity === 'rare' ? '🔮 rare' : '✨';
      setToast({
        id: Date.now(),
        text: `${rarityWord} — ${e.displayName} arrived!`,
        flavour: undefined,
      });
      window.setTimeout(() => setToast(null), 5000);
    },
  });

  return (
    <>
      <Topbar />
      <AgeGate />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <RealmCanvas />
            {idleSummary && (
              <div className="rounded-xl border border-realm-rare/30 bg-realm-rare/10 p-3 text-sm">
                {idleSummary}
              </div>
            )}
            <ResourcesStrip
              motes={resources.motes}
              ore={resources.ore}
              herbs={resources.herbs}
              artifacts={resources.artifacts}
              spiritCount={spiritCount}
              streak={streak}
            />
          </div>
          <aside className="space-y-4">
            <TimerOverlay />
            <TimerControls />
            <p className="text-xs text-realm-ink/60 dark:text-realm-parchment/60">
              Tip: switch tabs and study. Your timer is anchored to wall-clock time and won&apos;t
              drift.
            </p>
          </aside>
        </div>
        {toast && (
          <div
            role="status"
            className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full bg-realm-dusk px-5 py-2 text-sm text-realm-parchment shadow-lg"
          >
            {toast.text}
          </div>
        )}
      </main>
    </>
  );
}

function ResourcesStrip({
  motes,
  ore,
  herbs,
  artifacts,
  spiritCount,
  streak,
}: {
  motes: number;
  ore: number;
  herbs: number;
  artifacts: number;
  spiritCount: number;
  streak: number;
}) {
  const items = [
    { label: 'motes', value: Math.floor(motes) },
    { label: 'ore', value: Math.floor(ore) },
    { label: 'herbs', value: Math.floor(herbs) },
    { label: 'artifacts', value: Math.floor(artifacts) },
    { label: 'spirits', value: spiritCount },
    { label: 'streak', value: `${streak}d` },
  ];
  return (
    <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {items.map((i) => (
        <li
          key={i.label}
          className="rounded-xl border border-realm-ink/10 bg-white/60 p-3 text-center text-sm dark:border-white/10 dark:bg-white/5"
        >
          <div className="font-mono text-lg tabular-nums">{i.value}</div>
          <div className="text-xs text-realm-ink/60 dark:text-realm-parchment/60">{i.label}</div>
        </li>
      ))}
    </ul>
  );
}
