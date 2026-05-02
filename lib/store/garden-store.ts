'use client';

import { create } from 'zustand';
import { produce } from 'immer';
import {
  BadgeUnlock,
  CropSpeciesId,
  CropTier,
  InventoryEntry,
  PlantedCrop,
  SaveData,
  SessionRecord,
  SettingsState,
  StreakState,
  defaultSaveData,
} from '@/lib/persistence/schema';
import { loadSave, persistSave } from '@/lib/persistence/storage';
import { newlyEarnedStreakBadges, updateStreak } from '@/lib/stats/streak';
import { GARDEN_CAPACITY, getSpecies, seedlightFor } from '@/lib/garden/catalog';
import { growthFor } from '@/lib/garden/growth';
import { makeCropId, rollSeedsForSession } from '@/lib/garden/seeds';
import { UPGRADE_REQUIRED, canUpgrade, rollUpgrade } from '@/lib/garden/crafting';
import { canPurchase } from '@/lib/garden/shop';

export interface PlantOutcome {
  planted: PlantedCrop[];
  /** Crops auto-harvested into the inventory because the garden was full. */
  autoHarvested: PlantedCrop[];
}

interface GardenStore extends SaveData {
  hydrated: boolean;
  hydrate: () => void;
  /** Plant seeds derived from a completed focus session. */
  completeSession: (durationSec: number, focusedSec: number, now?: number) => PlantOutcome;
  /** Persist a session that was aborted (no seeds). */
  recordAbortedSession: (durationSec: number, focusedSec: number, now?: number) => void;
  /** Harvest one crop by id. Returns true on success. */
  harvest: (cropId: string, now?: number) => boolean;
  /** Harvest every mature crop in one pass. Returns count harvested. */
  harvestAllMature: (now?: number) => number;
  /** Try to upgrade a stack. Returns the roll outcome or null if conditions failed. */
  craftUpgrade: (
    speciesId: CropSpeciesId,
    fromTier: CropTier,
  ) => { toTier: CropTier; step: number } | null;
  /** Purchase a species in the seed shop. Returns true on success. */
  buySpecies: (speciesId: CropSpeciesId) => boolean;
  unlockBadge: (id: BadgeUnlock['id'], now?: number) => void;
  updateSettings: (patch: Partial<SettingsState>) => void;
  resetAll: () => void;
}

export const useGardenStore = create<GardenStore>((set, get) => ({
  ...defaultSaveData(),
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    const loaded = loadSave();
    set({ ...loaded, hydrated: true });
  },

  completeSession: (durationSec, focusedSec, now = Date.now()) => {
    const result: PlantOutcome = { planted: [], autoHarvested: [] };
    set(
      produce((draft: GardenStore) => {
        const seeds = rollSeedsForSession({
          durationMinutes: durationSec / 60,
          unlockedSpecies: draft.unlockedSpecies,
        });

        // Place each seed: prefer empty plot, else auto-harvest the most-mature crop
        // and reuse its slot. This keeps the loop going during full-garden moments.
        for (const seed of seeds) {
          const occupied = new Set(draft.plantedCrops.map((c) => c.plotIndex));
          let plotIndex = -1;
          for (let i = 0; i < GARDEN_CAPACITY; i++) {
            if (!occupied.has(i)) {
              plotIndex = i;
              break;
            }
          }
          if (plotIndex === -1) {
            // Garden full → auto-harvest the most-mature (oldest) crop into inventory.
            draft.plantedCrops.sort((a, b) => a.plantedAt - b.plantedAt);
            const evicted = draft.plantedCrops.shift();
            if (!evicted) continue;
            plotIndex = evicted.plotIndex;
            addToInventory(draft.inventory, evicted.speciesId, evicted.tier, 1);
            const sl = seedlightFor(getSpecies(evicted.speciesId), evicted.tier);
            draft.seedlight += sl;
            result.autoHarvested.push(evicted);
          }
          const crop: PlantedCrop = {
            id: makeCropId(),
            speciesId: seed.speciesId,
            tier: seed.tier,
            plotIndex,
            plantedAt: now,
          };
          draft.plantedCrops.push(crop);
          result.planted.push(crop);
        }

        const session: SessionRecord = {
          id: `r_${now.toString(36)}`,
          startedAt: now - durationSec * 1000,
          durationSec,
          focusedSec,
          completed: true,
          seedsPlanted: seeds.length,
        };
        draft.sessions.push(session);

        const newStreak = updateStreak(draft.streak, now);
        draft.streak = newStreak;
        draft.badges.push(...newlyEarnedStreakBadges(newStreak, draft.badges, now));
      }),
    );
    persistSave(snapshot(get()));
    return result;
  },

  recordAbortedSession: (durationSec, focusedSec, now = Date.now()) => {
    set(
      produce((draft: GardenStore) => {
        const session: SessionRecord = {
          id: `a_${now.toString(36)}`,
          startedAt: now - focusedSec * 1000,
          durationSec,
          focusedSec,
          completed: false,
        };
        draft.sessions.push(session);
      }),
    );
    persistSave(snapshot(get()));
  },

  harvest: (cropId, now = Date.now()) => {
    let ok = false;
    set(
      produce((draft: GardenStore) => {
        const idx = draft.plantedCrops.findIndex((c) => c.id === cropId);
        if (idx === -1) return;
        const crop = draft.plantedCrops[idx];
        const g = growthFor(crop, now);
        if (!g.mature) return;
        draft.plantedCrops.splice(idx, 1);
        addToInventory(draft.inventory, crop.speciesId, crop.tier, 1);
        const sl = seedlightFor(getSpecies(crop.speciesId), crop.tier);
        draft.seedlight += sl;
        if (!draft.badges.find((b) => b.id === 'first-harvest')) {
          draft.badges.push({ id: 'first-harvest', unlockedAt: now });
        }
        ok = true;
      }),
    );
    if (ok) persistSave(snapshot(get()));
    return ok;
  },

  harvestAllMature: (now = Date.now()) => {
    let harvested = 0;
    set(
      produce((draft: GardenStore) => {
        const remain: PlantedCrop[] = [];
        for (const crop of draft.plantedCrops) {
          if (growthFor(crop, now).mature) {
            addToInventory(draft.inventory, crop.speciesId, crop.tier, 1);
            const sl = seedlightFor(getSpecies(crop.speciesId), crop.tier);
            draft.seedlight += sl;
            harvested += 1;
          } else {
            remain.push(crop);
          }
        }
        draft.plantedCrops = remain;
        if (harvested > 0 && !draft.badges.find((b) => b.id === 'first-harvest')) {
          draft.badges.push({ id: 'first-harvest', unlockedAt: now });
        }
      }),
    );
    if (harvested > 0) persistSave(snapshot(get()));
    return harvested;
  },

  craftUpgrade: (speciesId, fromTier) => {
    if (!canUpgrade(fromTier)) return null;
    let outcome: { toTier: CropTier; step: number } | null = null;
    set(
      produce((draft: GardenStore) => {
        const entry = draft.inventory.find((e) => e.speciesId === speciesId && e.tier === fromTier);
        if (!entry || entry.count < UPGRADE_REQUIRED) return;
        entry.count -= UPGRADE_REQUIRED;
        if (entry.count === 0) {
          draft.inventory = draft.inventory.filter(
            (e) => !(e.speciesId === speciesId && e.tier === fromTier),
          );
        }
        const roll = rollUpgrade({ fromTier });
        if (!roll.toTier) return;
        addToInventory(draft.inventory, speciesId, roll.toTier, 1);
        outcome = { toTier: roll.toTier, step: roll.step };

        const now = Date.now();
        const tag = `first-${roll.toTier}` as BadgeUnlock['id'];
        if (
          (roll.toTier === 'rare' ||
            roll.toTier === 'epic' ||
            roll.toTier === 'legendary' ||
            roll.toTier === 'mythic') &&
          !draft.badges.find((b) => b.id === tag)
        ) {
          draft.badges.push({ id: tag, unlockedAt: now });
        }
      }),
    );
    if (outcome) persistSave(snapshot(get()));
    return outcome;
  },

  buySpecies: (speciesId) => {
    const state = get();
    const completedSessions = state.sessions.filter((s) => s.completed).length;
    const check = canPurchase({
      speciesId,
      completedSessions,
      unlockedSpecies: state.unlockedSpecies,
      seedlight: state.seedlight,
    });
    if (!check.ok) return false;
    const species = getSpecies(speciesId);
    set(
      produce((draft: GardenStore) => {
        draft.seedlight = Math.max(0, draft.seedlight - species.unlockCost);
        if (!draft.unlockedSpecies.includes(speciesId)) {
          draft.unlockedSpecies.push(speciesId);
        }
      }),
    );
    persistSave(snapshot(get()));
    return true;
  },

  unlockBadge: (id, now = Date.now()) => {
    if (get().badges.find((b) => b.id === id)) return;
    set(
      produce((draft: GardenStore) => {
        draft.badges.push({ id, unlockedAt: now });
      }),
    );
    persistSave(snapshot(get()));
  },

  updateSettings: (patch) => {
    set(
      produce((draft: GardenStore) => {
        draft.settings = { ...draft.settings, ...patch };
      }),
    );
    persistSave(snapshot(get()));
  },

  resetAll: () => {
    const fresh = defaultSaveData();
    set({ ...fresh, hydrated: true });
    persistSave(fresh);
  },
}));

function addToInventory(
  inv: InventoryEntry[],
  speciesId: CropSpeciesId,
  tier: CropTier,
  delta: number,
): void {
  const existing = inv.find((e) => e.speciesId === speciesId && e.tier === tier);
  if (existing) {
    existing.count += delta;
  } else {
    inv.push({ speciesId, tier, count: delta });
  }
}

function snapshot(store: GardenStore): SaveData {
  const {
    hydrated: _h,
    hydrate: _hd,
    completeSession: _cs,
    recordAbortedSession: _ra,
    harvest: _hv,
    harvestAllMature: _ha,
    craftUpgrade: _cu,
    buySpecies: _bs,
    unlockBadge: _ub,
    updateSettings: _us,
    resetAll: _r,
    ...data
  } = store;
  return data as SaveData;
}

export const selectAgeVerified = (s: GardenStore): boolean => s.settings.ageVerified;
export const selectPlanted = (s: GardenStore): PlantedCrop[] => s.plantedCrops;
export const selectInventory = (s: GardenStore): InventoryEntry[] => s.inventory;
export const selectSeedlight = (s: GardenStore): number => s.seedlight;
export const selectUnlocked = (s: GardenStore): CropSpeciesId[] => s.unlockedSpecies;
export const selectSessions = (s: GardenStore): SessionRecord[] => s.sessions;
export const selectStreak = (s: GardenStore): StreakState => s.streak;
export const selectBadges = (s: GardenStore): BadgeUnlock[] => s.badges;
export const selectSettings = (s: GardenStore): SettingsState => s.settings;
