import { SaveData, STORAGE_KEY, SCHEMA_VERSION, defaultSaveData } from './schema';
import { migrate } from './migrations';

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export function loadSave(): SaveData {
  if (!isBrowser) return defaultSaveData();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSaveData();
    const parsed = JSON.parse(raw) as Partial<SaveData> & { version?: number };
    return migrate(parsed, SCHEMA_VERSION);
  } catch (err) {
    console.warn('[focus-realm] failed to load save, starting fresh:', err);
    return defaultSaveData();
  }
}

export function persistSave(data: SaveData): void {
  if (!isBrowser) return;
  try {
    const next: SaveData = { ...data, updatedAt: Date.now() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (err) {
    console.warn('[focus-realm] failed to persist save:', err);
  }
}

export function clearSave(): void {
  if (!isBrowser) return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function exportSave(): string {
  return JSON.stringify(loadSave(), null, 2);
}
