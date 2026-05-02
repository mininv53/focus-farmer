import { Rarity } from '@/lib/persistence/schema';
import { SpiritSpecies, SPIRITS } from './catalog';

/**
 * Returns a weighted distribution over rarities based on session length.
 * Longer sessions raise odds of rare/legendary (a small ethical "variable reward"
 * tied to actual real-world focus, NOT to spending money).
 *
 * No outcome is "bad": even the smallest session reliably yields a spirit.
 */
export function rarityWeights(durationMinutes: number): Record<Rarity, number> {
  if (durationMinutes >= 45) return { common: 45, rare: 38, legendary: 17 };
  if (durationMinutes >= 25) return { common: 60, rare: 30, legendary: 10 };
  if (durationMinutes >= 15) return { common: 70, rare: 25, legendary: 5 };
  return { common: 80, rare: 18, legendary: 2 };
}

export interface RollContext {
  durationMinutes: number;
  completedSessionCount: number;
  /** Optional injected RNG (0..1) for deterministic tests. */
  rng?: () => number;
}

export function rollSpirit(ctx: RollContext): SpiritSpecies {
  const r = ctx.rng ?? Math.random;
  const weights = rarityWeights(ctx.durationMinutes);
  const totalRarityWeight = weights.common + weights.rare + weights.legendary;
  const rarityRoll = r() * totalRarityWeight;
  let chosenRarity: Rarity = 'common';
  if (rarityRoll < weights.common) chosenRarity = 'common';
  else if (rarityRoll < weights.common + weights.rare) chosenRarity = 'rare';
  else chosenRarity = 'legendary';

  const candidates = SPIRITS.filter(
    (s) =>
      s.rarity === chosenRarity &&
      (s.unlockAfterSessions === undefined || ctx.completedSessionCount >= s.unlockAfterSessions),
  );
  if (candidates.length === 0) {
    return SPIRITS.filter((s) => s.rarity === 'common')[0];
  }
  const idx = Math.floor(r() * candidates.length);
  return candidates[Math.min(idx, candidates.length - 1)];
}

let _idCounter = 0;
export function makeSpiritId(): string {
  _idCounter += 1;
  return `s_${Date.now().toString(36)}_${_idCounter.toString(36)}`;
}
