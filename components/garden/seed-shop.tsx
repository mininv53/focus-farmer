'use client';

import { useGardenStore } from '@/lib/store/garden-store';
import { buildShop } from '@/lib/garden/shop';
import { Button } from '@/components/ui/button';

export function SeedShop() {
  const sessions = useGardenStore((s) => s.sessions);
  const unlockedSpecies = useGardenStore((s) => s.unlockedSpecies);
  const seedlight = useGardenStore((s) => s.seedlight);
  const buy = useGardenStore((s) => s.buySpecies);

  const completedSessions = sessions.filter((s) => s.completed).length;
  const offers = buildShop({ completedSessions, unlockedSpecies, seedlight });

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-medium text-garden-loam dark:text-garden-cream">Seed shop</h3>
        <span className="font-mono text-sm tabular-nums text-garden-stem">
          ✦ {seedlight} seedlight
        </span>
      </div>
      <ul className="space-y-2">
        {offers.map((o) => {
          const canAfford = seedlight >= o.cost;
          const ready = o.available && canAfford && !o.unlocked;
          return (
            <li
              key={o.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-garden-loam/15 bg-white/60 p-3 dark:border-white/10 dark:bg-white/5"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium capitalize text-garden-loam dark:text-garden-cream">
                    {o.name}
                  </span>
                  {o.unlocked && (
                    <span className="rounded-full bg-garden-sprout/30 px-2 py-0.5 text-[10px] uppercase tracking-wide text-garden-stem">
                      planted
                    </span>
                  )}
                </div>
                <div className="text-xs text-garden-loam/60 dark:text-garden-cream/60">
                  {o.flavour}
                </div>
                {!o.unlocked && !o.available && (
                  <div className="mt-1 text-[11px] text-garden-rose">
                    unlocks after {o.unlockAfterSessions} sessions
                  </div>
                )}
              </div>
              {!o.unlocked && (
                <Button
                  size="sm"
                  variant={ready ? 'primary' : 'ghost'}
                  disabled={!ready}
                  onClick={() => buy(o.id)}
                  title={!o.available ? 'Locked by progression' : undefined}
                >
                  ✦ {o.cost}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      <p className="text-[11px] leading-relaxed text-garden-loam/60 dark:text-garden-cream/60">
        Seedlight comes from harvests. Real money cannot buy crops or randomness — only future
        cosmetic frames will be paid (with a parental PIN).
      </p>
    </div>
  );
}
