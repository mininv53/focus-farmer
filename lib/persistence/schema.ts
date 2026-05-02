/**
 * Versioned save schema. Bump SCHEMA_VERSION and add a migration when shape changes.
 *
 * v2: pivoted from "spirits + resources" to "crops + inventory" farm model.
 */
export const SCHEMA_VERSION = 2;
export const STORAGE_KEY = 'focus-realm:v1';

export type CropTier = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type CropSpeciesId =
  | 'carrot'
  | 'wheat'
  | 'strawberry'
  | 'tomato'
  | 'pumpkin'
  | 'sunflower'
  | 'grape'
  | 'pineapple';

/** A crop currently growing in a plot. */
export interface PlantedCrop {
  /** Stable id for this crop instance. */
  id: string;
  speciesId: CropSpeciesId;
  tier: CropTier;
  /** Plot index (0-based) on the garden grid. */
  plotIndex: number;
  /** Unix ms when planted. */
  plantedAt: number;
}

/** A stack of harvested crops in the inventory. */
export interface InventoryEntry {
  speciesId: CropSpeciesId;
  tier: CropTier;
  count: number;
}

export interface SessionRecord {
  id: string;
  startedAt: number;
  /** Seconds the user committed to focus. */
  durationSec: number;
  /** Seconds actually focused (==durationSec when completed). */
  focusedSec: number;
  completed: boolean;
  /** Number of seeds planted on completion. */
  seedsPlanted?: number;
}

export interface BadgeUnlock {
  id:
    | '7-day-streak'
    | '30-day-streak'
    | '100-day-streak'
    | 'first-harvest'
    | 'first-rare'
    | 'first-epic'
    | 'first-legendary'
    | 'first-mythic';
  unlockedAt: number;
}

export interface StreakState {
  current: number;
  longest: number;
  lastActiveDay: string | null;
}

export interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  audioEnabled: boolean;
  ambientVolume: number;
  reminderEnabled: boolean;
  reminderTime: string | null;
  ageVerified: boolean;
  parentalPin: string | null;
  reducedMotion: boolean;
}

export interface SaveData {
  version: number;
  createdAt: number;
  updatedAt: number;
  plantedCrops: PlantedCrop[];
  inventory: InventoryEntry[];
  unlockedSpecies: CropSpeciesId[];
  /** Free in-game currency earned from harvests (NEVER purchasable). */
  seedlight: number;
  sessions: SessionRecord[];
  streak: StreakState;
  badges: BadgeUnlock[];
  settings: SettingsState;
}

export const DEFAULT_UNLOCKED: CropSpeciesId[] = ['carrot', 'wheat'];

export const defaultSaveData = (): SaveData => ({
  version: SCHEMA_VERSION,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  plantedCrops: [],
  inventory: [],
  unlockedSpecies: [...DEFAULT_UNLOCKED],
  seedlight: 0,
  sessions: [],
  streak: { current: 0, longest: 0, lastActiveDay: null },
  badges: [],
  settings: {
    theme: 'system',
    audioEnabled: true,
    ambientVolume: 0.5,
    reminderEnabled: false,
    reminderTime: null,
    ageVerified: false,
    parentalPin: null,
    reducedMotion: false,
  },
});
