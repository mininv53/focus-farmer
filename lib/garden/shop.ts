import type { CropSpeciesId } from '@/lib/persistence/schema';
import { CROPS, getSpecies } from './catalog';

export interface ShopOffer {
  id: CropSpeciesId;
  name: string;
  cost: number;
  unlocked: boolean;
  available: boolean;
  unlockAfterSessions: number;
  flavour: string;
}

/**
 * Build the shop catalog given the player's progression. We expose all
 * species but mark unavailable ones as locked so the shop reads as a goal
 * board, not a paywall.
 */
export function buildShop(opts: {
  completedSessions: number;
  unlockedSpecies: readonly CropSpeciesId[];
  seedlight: number;
}): ShopOffer[] {
  return CROPS.map((c) => ({
    id: c.id,
    name: c.name,
    cost: c.unlockCost,
    unlocked: opts.unlockedSpecies.includes(c.id),
    available: opts.completedSessions >= c.unlockAfterSessions,
    unlockAfterSessions: c.unlockAfterSessions,
    flavour: c.flavour,
  }));
}

export function canPurchase(opts: {
  speciesId: CropSpeciesId;
  completedSessions: number;
  unlockedSpecies: readonly CropSpeciesId[];
  seedlight: number;
}): { ok: boolean; reason?: string } {
  if (opts.unlockedSpecies.includes(opts.speciesId)) {
    return { ok: false, reason: 'already-unlocked' };
  }
  const species = getSpecies(opts.speciesId);
  if (opts.completedSessions < species.unlockAfterSessions) {
    return { ok: false, reason: 'sessions-required' };
  }
  if (opts.seedlight < species.unlockCost) {
    return { ok: false, reason: 'not-enough-seedlight' };
  }
  return { ok: true };
}
