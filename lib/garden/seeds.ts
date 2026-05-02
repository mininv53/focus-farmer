import type { CropSpeciesId, CropTier } from '@/lib/persistence/schema';
import { GARDEN_CAPACITY, getSpecies } from './catalog';

export interface SeedRollContext {
  durationMinutes: number;
  unlockedSpecies: CropSpeciesId[];
  /** Optional injected RNG for deterministic tests. */
  rng?: () => number;
}

export interface PlantedSeed {
  speciesId: CropSpeciesId;
  /** Seeds always start at the lowest tier; higher tiers come from crafting. */
  tier: CropTier;
}

/**
 * Number of seeds a session yields based on its committed length.
 * Deterministic and capped at GARDEN_CAPACITY so a single session can never
 * overflow the whole garden.
 */
export function seedsFromSession(durationMinutes: number): number {
  const m = Math.round(durationMinutes);
  let count = 1;
  if (m >= 15) count = 2;
  if (m >= 25) count = 3;
  if (m >= 45) count = 5;
  return Math.min(count, GARDEN_CAPACITY);
}

/**
 * Roll a list of seeds for a completed session. Each seed is a uniformly
 * sampled species from the unlocked list; tier is always 'common' (rares come
 * from crafting only).
 */
export function rollSeedsForSession(ctx: SeedRollContext): PlantedSeed[] {
  const rng = ctx.rng ?? Math.random;
  const pool =
    ctx.unlockedSpecies.length > 0 ? ctx.unlockedSpecies : (['carrot', 'wheat'] as CropSpeciesId[]);
  const count = seedsFromSession(ctx.durationMinutes);
  const seeds: PlantedSeed[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(rng() * pool.length) % pool.length;
    const speciesId = pool[idx];
    // Sanity check the species exists in the catalog.
    getSpecies(speciesId);
    seeds.push({ speciesId, tier: 'common' });
  }
  return seeds;
}

export function makeCropId(): string {
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
