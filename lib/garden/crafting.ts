import type { CropTier } from '@/lib/persistence/schema';
import { TIER_ORDER } from './catalog';

/** Number of identical crops required to attempt one upgrade. */
export const UPGRADE_REQUIRED = 5;

export interface UpgradeWeights {
  /** Cumulative weights summing to 1.0 for: same+1, same+2, same+3 etc. */
  pass: number;
  jumpOne: number;
  jumpTwo: number;
  jumpThree: number;
}

/**
 * Outcome odds for upgrading a tier. Source tier on the left;
 * `pass` = next tier (most likely), jumps = skipping tiers (rare/legendary moments).
 *
 * No paid randomness anywhere — this RNG only fires when the player has
 * legitimately collected UPGRADE_REQUIRED commons (etc) from real focus sessions.
 */
const UPGRADE_TABLE: Record<CropTier, UpgradeWeights | null> = {
  common: { pass: 0.7, jumpOne: 0.22, jumpTwo: 0.07, jumpThree: 0.01 },
  rare: { pass: 0.7, jumpOne: 0.25, jumpTwo: 0.05, jumpThree: 0 },
  epic: { pass: 0.7, jumpOne: 0.3, jumpTwo: 0, jumpThree: 0 },
  legendary: { pass: 1, jumpOne: 0, jumpTwo: 0, jumpThree: 0 },
  mythic: null, // No further upgrade.
};

export interface UpgradeContext {
  fromTier: CropTier;
  /** Optional injected RNG for tests. */
  rng?: () => number;
}

export interface UpgradeResult {
  /** Resulting tier on success, or null if not upgradable. */
  toTier: CropTier | null;
  /** Number of tier steps gained (1 = pass, 2 = small skip, 3 = big skip). */
  step: number;
}

export function canUpgrade(fromTier: CropTier): boolean {
  return UPGRADE_TABLE[fromTier] !== null;
}

export function rollUpgrade(ctx: UpgradeContext): UpgradeResult {
  const weights = UPGRADE_TABLE[ctx.fromTier];
  if (!weights) return { toTier: null, step: 0 };
  const fromIdx = TIER_ORDER.indexOf(ctx.fromTier);
  const rng = ctx.rng ?? Math.random;
  const r = rng();
  let acc = weights.pass;
  let step = 1;
  if (r < acc) step = 1;
  else {
    acc += weights.jumpOne;
    if (r < acc) step = 2;
    else {
      acc += weights.jumpTwo;
      if (r < acc) step = 3;
      else step = 4;
    }
  }
  const targetIdx = Math.min(TIER_ORDER.length - 1, fromIdx + step);
  return { toTier: TIER_ORDER[targetIdx], step: targetIdx - fromIdx };
}
