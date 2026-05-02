/**
 * Versioned save schema. Bump SCHEMA_VERSION and add a migration when shape changes.
 */
export const SCHEMA_VERSION = 1;
export const STORAGE_KEY = 'focus-realm:v1';

export type Rarity = 'common' | 'rare' | 'legendary';

export interface SpiritInstance {
  /** Stable id for this spirit instance. */
  id: string;
  /** Spirit catalog id (e.g. "timothy-mole"). */
  speciesId: string;
  /** Rarity rolled at summon time. */
  rarity: Rarity;
  /** Plot index (0-based) on the realm grid. */
  plotIndex: number;
  /** Unix ms when summoned. */
  summonedAt: number;
  /** Unix ms when their last idle resource production was harvested. */
  lastHarvestedAt: number;
  /** Custom name shown in UI ("Timothy", "Lily" etc). */
  displayName: string;
}

export interface SessionRecord {
  id: string;
  startedAt: number;
  /** Seconds the user committed to focus. */
  durationSec: number;
  /** Seconds actually focused (==durationSec when completed). */
  focusedSec: number;
  completed: boolean;
  spiritId?: string;
}

export interface BadgeUnlock {
  id:
    | '7-day-streak'
    | '30-day-streak'
    | '100-day-streak'
    | 'first-spirit'
    | 'first-rare'
    | 'first-legendary';
  unlockedAt: number;
}

export interface StreakState {
  current: number;
  longest: number;
  lastActiveDay: string | null;
}

export interface ResourceLedger {
  motes: number;
  ore: number;
  herbs: number;
  artifacts: number;
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
  spirits: SpiritInstance[];
  sessions: SessionRecord[];
  streak: StreakState;
  badges: BadgeUnlock[];
  resources: ResourceLedger;
  settings: SettingsState;
}

export const defaultSaveData = (): SaveData => ({
  version: SCHEMA_VERSION,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  spirits: [],
  sessions: [],
  streak: { current: 0, longest: 0, lastActiveDay: null },
  badges: [],
  resources: { motes: 0, ore: 0, herbs: 0, artifacts: 0 },
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
