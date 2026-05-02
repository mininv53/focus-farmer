import { Rarity } from '@/lib/persistence/schema';

export type ResourceKey = 'motes' | 'ore' | 'herbs' | 'artifacts';

export interface SpiritSpecies {
  id: string;
  displayName: string;
  rarity: Rarity;
  /** Resources produced per real-world minute while idle. */
  yieldsPerMinute: Partial<Record<ResourceKey, number>>;
  /** A short flavour line shown in summon toast and idle reports. */
  flavour: string;
  /** Hue (0-360) for procedural sprite generation. */
  hue: number;
  /** Body shape used by procedural texture. */
  shape: 'creature' | 'fairy' | 'crystal';
  /** Required completed sessions before this spirit can appear. */
  unlockAfterSessions?: number;
}

export const SPIRITS: SpiritSpecies[] = [
  {
    id: 'pip-sprout',
    displayName: 'Pip the Sprout',
    rarity: 'common',
    yieldsPerMinute: { motes: 1.0 },
    flavour: 'Tends the moss while you study.',
    hue: 95,
    shape: 'creature',
  },
  {
    id: 'timothy-mole',
    displayName: 'Timothy the Mole',
    rarity: 'common',
    yieldsPerMinute: { motes: 0.6, ore: 0.4 },
    flavour: 'Quietly digs in the dark.',
    hue: 28,
    shape: 'creature',
  },
  {
    id: 'lily-fairy',
    displayName: 'Lily the Fairy',
    rarity: 'common',
    yieldsPerMinute: { motes: 0.7, herbs: 0.3 },
    flavour: 'Hums while she gardens.',
    hue: 320,
    shape: 'fairy',
  },
  {
    id: 'echo-lantern',
    displayName: 'Echo the Lantern',
    rarity: 'rare',
    yieldsPerMinute: { motes: 2.5, herbs: 0.4 },
    flavour: 'Carries a light only the focused can see.',
    hue: 200,
    shape: 'crystal',
  },
  {
    id: 'onyx-crow',
    displayName: 'Onyx the Crow',
    rarity: 'rare',
    yieldsPerMinute: { motes: 1.4, ore: 0.8, artifacts: 0.02 },
    flavour: 'Brings shiny things home.',
    hue: 270,
    shape: 'creature',
  },
  {
    id: 'mira-brook',
    displayName: 'Mira the Brook',
    rarity: 'rare',
    yieldsPerMinute: { motes: 1.8, herbs: 1.2 },
    flavour: 'Sings to the herbs and they grow.',
    hue: 180,
    shape: 'fairy',
  },
  {
    id: 'solstice-phoenix',
    displayName: 'Solstice the Phoenix',
    rarity: 'legendary',
    yieldsPerMinute: { motes: 5.0, herbs: 1.0 },
    flavour: 'Wakes only for the truly focused.',
    hue: 30,
    shape: 'fairy',
    unlockAfterSessions: 10,
  },
  {
    id: 'aurora-dragon',
    displayName: 'Aurora the Dragon',
    rarity: 'legendary',
    yieldsPerMinute: { motes: 4.0, ore: 1.5, artifacts: 0.05 },
    flavour: 'Old as the realm itself. She remembers.',
    hue: 280,
    shape: 'creature',
    unlockAfterSessions: 10,
  },
];

export const SPIRIT_BY_ID = Object.fromEntries(SPIRITS.map((s) => [s.id, s]));

/** Maximum number of spirits the realm can hold simultaneously in MVP. */
export const REALM_CAPACITY = 8;

/** Maximum hours of idle production that accumulate while away. */
export const IDLE_CAP_HOURS = 8;
