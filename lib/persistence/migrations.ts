import { SaveData, defaultSaveData } from './schema';

/**
 * Apply migrations to bring an arbitrary save object up to the current schema version.
 * Each migration mutates and bumps the version field.
 */
export function migrate(raw: Partial<SaveData> & { version?: number }, target: number): SaveData {
  const base = { ...defaultSaveData(), ...raw } as SaveData;
  let v = base.version ?? 0;
  let cur: SaveData = { ...base, version: v };
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
      return { ...data };
    default:
      return data;
  }
}
