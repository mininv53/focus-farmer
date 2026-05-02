'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Topbar } from '@/components/nav/topbar';
import { AgeGate } from '@/components/age-gate/age-gate';
import { TimerControls } from '@/components/timer/timer-controls';
import { TimerOverlay } from '@/components/timer/timer-overlay';
import { useTimerEngine } from '@/components/timer/use-timer-engine';
import { useGardenStore } from '@/lib/store/garden-store';
import { useTimerStore } from '@/lib/store/timer-store';
import { Button } from '@/components/ui/button';
import { InventoryPanel } from '@/components/garden/inventory-panel';
import { SeedShop } from '@/components/garden/seed-shop';
import { TIER_LABEL, getSpecies } from '@/lib/garden/catalog';
import { partitionByMaturity } from '@/lib/garden/growth';
import type { CropTier } from '@/lib/persistence/schema';

const GardenCanvas = dynamic(
  () => import('@/components/garden/garden-canvas').then((m) => m.GardenCanvas),
  {
    ssr: false,
    loading: () => <div className="aspect-[11/9] animate-pulse rounded-2xl bg-garden-loam/10" />,
  },
);

interface Toast {
  id: number;
  text: string;
  emphasis?: 'plain' | 'rare' | 'epic' | 'legendary' | 'mythic';
}

const TIER_TOAST: Record<CropTier, { emoji: string; emphasis: Toast['emphasis'] }> = {
  common: { emoji: '🌱', emphasis: 'plain' },
  rare: { emoji: '✨', emphasis: 'rare' },
  epic: { emoji: '🌟', emphasis: 'epic' },
  legendary: { emoji: '💫', emphasis: 'legendary' },
  mythic: { emoji: '🌌', emphasis: 'mythic' },
};

export default function PlayPage() {
  const [toast, setToast] = useState<Toast | null>(null);
  const [tab, setTab] = useState<'inventory' | 'shop'>('inventory');

  const hydrate = useGardenStore((s) => s.hydrate);
  const hydrateTimer = useTimerStore((s) => s.hydrate);
  const hydrated = useGardenStore((s) => s.hydrated);
  const planted = useGardenStore((s) => s.plantedCrops);
  const inventory = useGardenStore((s) => s.inventory);
  const seedlight = useGardenStore((s) => s.seedlight);
  const streak = useGardenStore((s) => s.streak.current);
  const harvestAllMature = useGardenStore((s) => s.harvestAllMature);

  useEffect(() => {
    hydrate();
    hydrateTimer();
  }, [hydrate, hydrateTimer]);

  useTimerEngine({
    onComplete: (e) => {
      if (e.planted.length > 0) {
        const list = e.planted
          .map((p) => getSpecies(p.speciesId).name.toLowerCase())
          .slice(0, 3)
          .join(', ');
        const more = e.planted.length > 3 ? ` +${e.planted.length - 3} more` : '';
        showToast(
          `🌱 planted ${e.planted.length} seed${e.planted.length === 1 ? '' : 's'} — ${list}${more}`,
        );
      }
      if (e.autoHarvested.length > 0) {
        showToast(
          `🧺 garden was full — auto-harvested ${e.autoHarvested.length} ripe crop${e.autoHarvested.length === 1 ? '' : 's'}.`,
        );
      }
    },
  });

  const showToast = (text: string, emphasis: Toast['emphasis'] = 'plain') => {
    setToast({ id: Date.now(), text, emphasis });
    window.setTimeout(() => setToast(null), 4500);
  };

  // Force a re-render every 5s so the "ripe count" + headers reflect growth
  // even when the user isn't interacting.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 5000);
    return () => window.clearInterval(id);
  }, []);

  const { mature } = partitionByMaturity(planted, Date.now() + tick * 0); // tick used to bust memo

  return (
    <>
      <Topbar />
      <AgeGate />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr_320px]">
          {/* LEFT: timer */}
          <aside className="space-y-4">
            <TimerOverlay />
            <TimerControls />
            <div className="rounded-xl border border-garden-loam/10 bg-garden-cream/70 p-3 text-xs text-garden-loam/70 dark:border-white/10 dark:bg-white/5 dark:text-garden-cream/70">
              <p className="font-medium text-garden-loam dark:text-garden-cream">Tip</p>
              <p className="mt-1">
                The timer is anchored to wall-clock — switch tabs and study, your seeds will be
                planted when the session ends.
              </p>
            </div>
            <StatStrip seedlight={seedlight} streak={streak} planted={planted.length} />
          </aside>

          {/* CENTER: garden + summary */}
          <section className="space-y-4">
            <GardenCanvas />
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-garden-loam/15 bg-garden-cream/60 p-3 text-sm dark:border-white/10 dark:bg-white/5">
              <div>
                {mature.length > 0 ? (
                  <span className="text-garden-stem">
                    🍓 {mature.length} crop{mature.length === 1 ? '' : 's'} ready to harvest
                  </span>
                ) : planted.length > 0 ? (
                  <span className="text-garden-loam/70 dark:text-garden-cream/70">
                    {planted.length} crop{planted.length === 1 ? '' : 's'} growing
                  </span>
                ) : (
                  <span className="text-garden-loam/70 dark:text-garden-cream/70">
                    empty plots — start a focus session to plant
                  </span>
                )}
              </div>
              <Button
                size="sm"
                disabled={mature.length === 0}
                onClick={() => {
                  const n = harvestAllMature();
                  if (n > 0) showToast(`🧺 harvested ${n} crop${n === 1 ? '' : 's'}.`);
                }}
              >
                harvest all
              </Button>
            </div>
            {hydrated && inventory.length > 0 && <RarityHighlights />}
          </section>

          {/* RIGHT: tabs (inventory / shop) */}
          <aside className="space-y-3">
            <div className="flex gap-1 rounded-full bg-garden-loam/10 p-1 dark:bg-white/5">
              <TabButton active={tab === 'inventory'} onClick={() => setTab('inventory')}>
                inventory
              </TabButton>
              <TabButton active={tab === 'shop'} onClick={() => setTab('shop')}>
                shop
              </TabButton>
            </div>
            {tab === 'inventory' ? (
              <InventoryPanel
                onUpgrade={(toTier, step) => {
                  const t = TIER_TOAST[toTier];
                  const burst = step >= 2 ? ' (skip!)' : '';
                  showToast(`${t.emoji} crafted a ${TIER_LABEL[toTier]}${burst}`, t.emphasis);
                }}
              />
            ) : (
              <SeedShop />
            )}
          </aside>
        </div>

        {toast && (
          <div
            role="status"
            className={`fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full px-5 py-2 text-sm shadow-lg ${
              toast.emphasis === 'mythic'
                ? 'bg-garden-mythic text-white'
                : toast.emphasis === 'legendary'
                  ? 'bg-garden-legendary text-white'
                  : toast.emphasis === 'epic'
                    ? 'bg-garden-epic text-garden-loam'
                    : toast.emphasis === 'rare'
                      ? 'bg-garden-rare text-garden-loam'
                      : 'bg-garden-loam text-garden-cream'
            }`}
          >
            {toast.text}
          </div>
        )}
      </main>
    </>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-full px-3 py-1 text-xs uppercase tracking-wide transition ${
        active
          ? 'bg-garden-loam text-garden-cream shadow'
          : 'text-garden-loam/70 hover:bg-garden-loam/5 dark:text-garden-cream/70'
      }`}
    >
      {children}
    </button>
  );
}

function StatStrip({
  seedlight,
  streak,
  planted,
}: {
  seedlight: number;
  streak: number;
  planted: number;
}) {
  return (
    <ul className="grid grid-cols-3 gap-2 text-center">
      <Stat label="seedlight" value={seedlight} />
      <Stat label="streak" value={`${streak}d`} />
      <Stat label="planted" value={planted} />
    </ul>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <li className="rounded-xl border border-garden-loam/10 bg-white/60 p-2 dark:border-white/10 dark:bg-white/5">
      <div className="font-mono text-base tabular-nums text-garden-loam dark:text-garden-cream">
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wide text-garden-loam/60 dark:text-garden-cream/60">
        {label}
      </div>
    </li>
  );
}

/** Showcase row for legendary/mythic stacks the player has earned. */
function RarityHighlights() {
  const inventory = useGardenStore((s) => s.inventory);
  const trophies = inventory.filter((e) => e.tier === 'legendary' || e.tier === 'mythic');
  if (trophies.length === 0) return null;
  return (
    <div className="rounded-xl border border-garden-legendary/40 bg-gradient-to-r from-garden-legendary/15 via-garden-mythic/10 to-garden-rare/15 p-3 text-xs dark:border-white/10">
      <div className="mb-1 font-medium text-garden-loam dark:text-garden-cream">Trophy shelf</div>
      <ul className="flex flex-wrap gap-2">
        {trophies.map((e) => (
          <li
            key={`${e.speciesId}:${e.tier}`}
            className={`rounded-full px-2 py-1 ${
              e.tier === 'mythic' ? 'bg-garden-mythic text-white' : 'bg-garden-legendary text-white'
            }`}
          >
            {getSpecies(e.speciesId).name} · {TIER_LABEL[e.tier]} ×{e.count}
          </li>
        ))}
      </ul>
    </div>
  );
}
