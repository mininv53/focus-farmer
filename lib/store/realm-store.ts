'use client';

import { create } from 'zustand';
import { produce } from 'immer';
import {
  BadgeUnlock,
  ResourceLedger,
  SaveData,
  SessionRecord,
  SettingsState,
  SpiritInstance,
  StreakState,
  defaultSaveData,
} from '@/lib/persistence/schema';
import { loadSave, persistSave } from '@/lib/persistence/storage';
import { tickIdle } from '@/lib/spirits/idle';
import { newlyEarnedStreakBadges, updateStreak } from '@/lib/stats/streak';
import { rollSpirit, makeSpiritId } from '@/lib/spirits/rng';
import { REALM_CAPACITY } from '@/lib/spirits/catalog';

interface RealmStore extends SaveData {
  hydrated: boolean;
  hydrate: () => void;
  /** Compute & credit idle accrual for all spirits up to `now`. */
  collectIdle: (now?: number) => ResourceLedger;
  /** Persist a completed session and roll a new spirit. Returns the spirit summoned. */
  completeSession: (durationSec: number, focusedSec: number, now?: number) => SpiritInstance | null;
  /** Persist a session that was aborted (no spirit). */
  recordAbortedSession: (durationSec: number, focusedSec: number, now?: number) => void;
  unlockBadge: (id: BadgeUnlock['id'], now?: number) => void;
  updateSettings: (patch: Partial<SettingsState>) => void;
  resetAll: () => void;
}

export const useRealmStore = create<RealmStore>((set, get) => ({
  ...defaultSaveData(),
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    const loaded = loadSave();
    set({ ...loaded, hydrated: true });
  },

  collectIdle: (now = Date.now()) => {
    const result = tickIdle(get().spirits, get().resources, now);
    set(
      produce((draft: RealmStore) => {
        draft.resources = result.ledger;
        draft.spirits = result.spirits;
      }),
    );
    persistSave(snapshot(get()));
    return result.gained;
  },

  completeSession: (durationSec, focusedSec, now = Date.now()) => {
    let summoned: SpiritInstance | null = null;
    set(
      produce((draft: RealmStore) => {
        const completedCount = draft.sessions.filter((s) => s.completed).length;
        const species = rollSpirit({
          durationMinutes: durationSec / 60,
          completedSessionCount: completedCount,
        });

        // Find a free plot or recycle the oldest spirit (FIFO).
        let plotIndex = -1;
        const occupied = new Set(draft.spirits.map((s) => s.plotIndex));
        for (let i = 0; i < REALM_CAPACITY; i++) {
          if (!occupied.has(i)) {
            plotIndex = i;
            break;
          }
        }
        if (plotIndex === -1 && draft.spirits.length > 0) {
          // Realm full → oldest spirit moves on, releasing its plot.
          draft.spirits.sort((a, b) => a.summonedAt - b.summonedAt);
          plotIndex = draft.spirits[0].plotIndex;
          draft.spirits.shift();
        }
        if (plotIndex === -1) plotIndex = 0;

        const inst: SpiritInstance = {
          id: makeSpiritId(),
          speciesId: species.id,
          rarity: species.rarity,
          plotIndex,
          summonedAt: now,
          lastHarvestedAt: now,
          displayName: species.displayName,
        };
        draft.spirits.push(inst);
        summoned = inst;

        const session: SessionRecord = {
          id: `r_${now.toString(36)}`,
          startedAt: now - durationSec * 1000,
          durationSec,
          focusedSec,
          completed: true,
          spiritId: inst.id,
        };
        draft.sessions.push(session);

        const newStreak = updateStreak(draft.streak, now);
        draft.streak = newStreak;
        const earned = newlyEarnedStreakBadges(newStreak, draft.badges, now);
        draft.badges.push(...earned);

        if (!draft.badges.find((b) => b.id === 'first-spirit')) {
          draft.badges.push({ id: 'first-spirit', unlockedAt: now });
        }
        if (species.rarity === 'rare' && !draft.badges.find((b) => b.id === 'first-rare')) {
          draft.badges.push({ id: 'first-rare', unlockedAt: now });
        }
        if (
          species.rarity === 'legendary' &&
          !draft.badges.find((b) => b.id === 'first-legendary')
        ) {
          draft.badges.push({ id: 'first-legendary', unlockedAt: now });
        }
      }),
    );
    persistSave(snapshot(get()));
    return summoned;
  },

  recordAbortedSession: (durationSec, focusedSec, now = Date.now()) => {
    set(
      produce((draft: RealmStore) => {
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

  unlockBadge: (id, now = Date.now()) => {
    if (get().badges.find((b) => b.id === id)) return;
    set(
      produce((draft: RealmStore) => {
        draft.badges.push({ id, unlockedAt: now });
      }),
    );
    persistSave(snapshot(get()));
  },

  updateSettings: (patch) => {
    set(
      produce((draft: RealmStore) => {
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

function snapshot(store: RealmStore): SaveData {
  const {
    hydrated: _h,
    hydrate: _hd,
    collectIdle: _c,
    completeSession: _cs,
    recordAbortedSession: _ra,
    unlockBadge: _ub,
    updateSettings: _us,
    resetAll: _r,
    ...data
  } = store;
  return data as SaveData;
}

export function selectAgeVerified(s: RealmStore): boolean {
  return s.settings.ageVerified;
}

export function selectSpirits(s: RealmStore): SpiritInstance[] {
  return s.spirits;
}

export function selectResources(s: RealmStore): ResourceLedger {
  return s.resources;
}

export function selectSessions(s: RealmStore): SessionRecord[] {
  return s.sessions;
}

export function selectStreak(s: RealmStore): StreakState {
  return s.streak;
}

export function selectBadges(s: RealmStore): BadgeUnlock[] {
  return s.badges;
}

export function selectSettings(s: RealmStore): SettingsState {
  return s.settings;
}
