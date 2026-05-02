import type { CropSpeciesId, CropTier } from '@/lib/persistence/schema';

/** Number of plots in the garden grid (cols × rows). */
export const GARDEN_COLS = 4;
export const GARDEN_ROWS = 3;
export const GARDEN_CAPACITY = GARDEN_COLS * GARDEN_ROWS;

/** Cap how much offline growth we credit so leaving the game is never punished
 * but we don't trivialize progression either. */
export const OFFLINE_GROWTH_CAP_HOURS = 8;

/** Seconds per growth stage. 4 stages → fully mature in (4 * STAGE_SECONDS) seconds. */
export const STAGE_SECONDS = 45;
/** Total stages a crop transitions through. 0..STAGE_COUNT-1 are growing, STAGE_COUNT means mature. */
export const STAGE_COUNT = 4;

export type CropShape = 'root' | 'stalk' | 'bush' | 'vine' | 'tree';

export interface CropSpecies {
  id: CropSpeciesId;
  name: string;
  /** Hue (0-360) used by procedural pixel textures. */
  hue: number;
  shape: CropShape;
  /** Base seedlight earned when harvesting a common-tier crop of this species. */
  baseSeedlight: number;
  /** Cost to unlock in the seed shop (in seedlight). 0 = unlocked at start. */
  unlockCost: number;
  /** Sessions completed before this species can appear in the shop at all. */
  unlockAfterSessions: number;
  flavour: string;
}

export const CROPS: readonly CropSpecies[] = [
  {
    id: 'carrot',
    name: 'Carrot',
    hue: 28,
    shape: 'root',
    baseSeedlight: 1,
    unlockCost: 0,
    unlockAfterSessions: 0,
    flavour: 'Honest, dependable, slightly stubborn.',
  },
  {
    id: 'wheat',
    name: 'Wheat',
    hue: 48,
    shape: 'stalk',
    baseSeedlight: 1,
    unlockCost: 0,
    unlockAfterSessions: 0,
    flavour: 'Quiet rows that hum when the wind passes.',
  },
  {
    id: 'strawberry',
    name: 'Strawberry',
    hue: 358,
    shape: 'bush',
    baseSeedlight: 2,
    unlockCost: 60,
    unlockAfterSessions: 2,
    flavour: 'Hides under leaves like a small secret.',
  },
  {
    id: 'tomato',
    name: 'Tomato',
    hue: 8,
    shape: 'bush',
    baseSeedlight: 2,
    unlockCost: 80,
    unlockAfterSessions: 3,
    flavour: 'Loud red, soft inside.',
  },
  {
    id: 'pumpkin',
    name: 'Pumpkin',
    hue: 22,
    shape: 'vine',
    baseSeedlight: 4,
    unlockCost: 200,
    unlockAfterSessions: 5,
    flavour: 'Patient. Worth the wait.',
  },
  {
    id: 'sunflower',
    name: 'Sunflower',
    hue: 50,
    shape: 'stalk',
    baseSeedlight: 4,
    unlockCost: 240,
    unlockAfterSessions: 6,
    flavour: 'Tracks the sun. Never asks for permission.',
  },
  {
    id: 'grape',
    name: 'Grape',
    hue: 290,
    shape: 'vine',
    baseSeedlight: 8,
    unlockCost: 600,
    unlockAfterSessions: 10,
    flavour: 'A whole evening compressed into one bunch.',
  },
  {
    id: 'pineapple',
    name: 'Pineapple',
    hue: 50,
    shape: 'tree',
    baseSeedlight: 8,
    unlockCost: 800,
    unlockAfterSessions: 12,
    flavour: 'Spiky but generous when you commit.',
  },
];

export function getSpecies(id: CropSpeciesId): CropSpecies {
  const found = CROPS.find((c) => c.id === id);
  if (!found) {
    throw new Error(`Unknown crop species: ${id}`);
  }
  return found;
}

/** Tier ordering for upgrade chains: common < rare < epic < legendary < mythic. */
export const TIER_ORDER: readonly CropTier[] = ['common', 'rare', 'epic', 'legendary', 'mythic'];

/** Tailwind colour class names for tier glows / borders. */
export const TIER_COLORS: Record<CropTier, string> = {
  common: 'garden-common',
  rare: 'garden-rare',
  epic: 'garden-epic',
  legendary: 'garden-legendary',
  mythic: 'garden-mythic',
};

/** Display label for tiers. */
export const TIER_LABEL: Record<CropTier, string> = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
  mythic: 'Mythic',
};

/**
 * Seedlight earned for harvesting a crop of given tier.
 * Reward scales with tier so high-tier crops feel valuable.
 */
export function seedlightFor(species: CropSpecies, tier: CropTier): number {
  const tierMult: Record<CropTier, number> = {
    common: 1,
    rare: 4,
    epic: 16,
    legendary: 64,
    mythic: 256,
  };
  return Math.round(species.baseSeedlight * tierMult[tier]);
}
