import { DEFAULT_UNLOCKED, SaveData, defaultSaveData } from './schema';

/**
 * Apply migrations to bring an arbitrary save object up to the current schema version.
 * Each migration converts shape and bumps the version field.
 */
export function migrate(
  raw: Partial<SaveData> & { version?: number; spirits?: unknown; resources?: unknown },
  target: number,
): SaveData {
  const fresh = defaultSaveData();
  // Merge keys we know to preserve; unknown keys (e.g. from older versions) are dropped
  // unless a migration step preserves them explicitly.
  const merged = { ...fresh, ...(raw as Partial<SaveData>) } as SaveData & {
    spirits?: unknown;
    resources?: unknown;
  };
  let v = (raw.version as number | undefined) ?? 0;
  let cur: SaveData = { ...merged, version: v };
  while (v < target) {
    cur = applyMigration(cur, v);
    v += 1;
    cur.version = v;
  }
  return cur;
}

function applyMigration(data: SaveData, fromVersion: number): SaveData {
  switch (fromVersion) {
    case 0:
      // No-op: 0 → 1 was a placeholder before the farm pivot.
      return { ...data };
    case 1: {
      // 1 → 2: drop the old spirits + resources fields, install the farm shape.
      const next: SaveData = {
        ...data,
        plantedCrops: [],
        inventory: [],
        unlockedSpecies: [...DEFAULT_UNLOCKED],
        seedlight: 0,
      };
      // Remove legacy fields so they don't leak through stringify.
      const legacy = next as SaveData & { spirits?: unknown; resources?: unknown };
      delete legacy.spirits;
      delete legacy.resources;
      return next;
    }
    default:
      return data;
  }
}
