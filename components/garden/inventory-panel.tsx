'use client';

import { useGardenStore } from '@/lib/store/garden-store';
import { TIER_LABEL, getSpecies } from '@/lib/garden/catalog';
import { UPGRADE_REQUIRED, canUpgrade } from '@/lib/garden/crafting';
import { Button } from '@/components/ui/button';
import { CropTier } from '@/lib/persistence/schema';

interface InventoryPanelProps {
  onUpgrade?: (newTier: CropTier, step: number) => void;
}

const TIER_BG: Record<CropTier, string> = {
  common: 'border-garden-common/40 bg-garden-common/15',
  rare: 'border-garden-rare/60 bg-garden-rare/20',
  epic: 'border-garden-epic/60 bg-garden-epic/20',
  legendary: 'border-garden-legendary/70 bg-garden-legendary/25',
  mythic: 'border-garden-mythic/70 bg-garden-mythic/25',
};

const TIER_TEXT: Record<CropTier, string> = {
  common: 'text-garden-stem',
  rare: 'text-[#6b5bc1]',
  epic: 'text-[#268a72]',
  legendary: 'text-[#b35e44]',
  mythic: 'text-garden-mythic',
};

export function InventoryPanel({ onUpgrade }: InventoryPanelProps) {
  const inventory = useGardenStore((s) => s.inventory);
  const craftUpgrade = useGardenStore((s) => s.craftUpgrade);

  if (inventory.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-garden-loam/20 bg-garden-cream/40 p-4 text-sm text-garden-loam/70 dark:border-white/10 dark:bg-white/5 dark:text-garden-cream/70">
        Empty basket. Finish a focus session to plant seeds, then harvest ripe crops.
      </div>
    );
  }

  // Sort: tier ascending, then species name. (Common stacks at top so the
  // upgrade affordance is the first thing the eye lands on.)
  const sorted = [...inventory].sort((a, b) => {
    const order: CropTier[] = ['common', 'rare', 'epic', 'legendary', 'mythic'];
    const ta = order.indexOf(a.tier);
    const tb = order.indexOf(b.tier);
    if (ta !== tb) return ta - tb;
    return a.speciesId.localeCompare(b.speciesId);
  });

  return (
    <ul className="space-y-2">
      {sorted.map((entry) => {
        const species = getSpecies(entry.speciesId);
        const upgradable = canUpgrade(entry.tier) && entry.count >= UPGRADE_REQUIRED;
        return (
          <li
            key={`${entry.speciesId}:${entry.tier}`}
            className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${TIER_BG[entry.tier]}`}
          >
            <div className="flex items-center gap-3">
              <CropGlyph speciesId={entry.speciesId} tier={entry.tier} />
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-garden-loam dark:text-garden-cream">
                    {species.name}
                  </span>
                  <span className={`text-xs uppercase tracking-wide ${TIER_TEXT[entry.tier]}`}>
                    {TIER_LABEL[entry.tier]}
                  </span>
                </div>
                <div className="text-xs text-garden-loam/60 dark:text-garden-cream/60">
                  ×{entry.count}
                </div>
              </div>
            </div>
            {canUpgrade(entry.tier) && (
              <Button
                variant={upgradable ? 'primary' : 'ghost'}
                size="sm"
                disabled={!upgradable}
                title={
                  upgradable
                    ? `Combine ${UPGRADE_REQUIRED} for a chance at higher tier`
                    : `Need ${UPGRADE_REQUIRED} to upgrade (${UPGRADE_REQUIRED - entry.count} more)`
                }
                onClick={() => {
                  const out = craftUpgrade(entry.speciesId, entry.tier);
                  if (out) onUpgrade?.(out.toTier, out.step);
                }}
              >
                upgrade ×{UPGRADE_REQUIRED}
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Tiny coloured square; until proper crop icons are dropped into /public/sprites/ this stays. */
function CropGlyph({
  speciesId,
  tier,
}: {
  speciesId: ReturnType<typeof getSpecies>['id'];
  tier: CropTier;
}) {
  const species = getSpecies(speciesId);
  return (
    <div
      aria-hidden
      className="flex h-9 w-9 items-center justify-center rounded-md border-2"
      style={{
        borderColor: `hsl(${species.hue} 65% 55%)`,
        background: `hsl(${species.hue} 60% 88%)`,
      }}
    >
      <span className="text-xs uppercase">{species.name.slice(0, 1)}</span>
      <span
        aria-hidden
        className="absolute ml-7 mt-7 h-2 w-2 rounded-full"
        style={{ background: `var(--tw-color-garden-${tier}, currentColor)` }}
      />
    </div>
  );
}
