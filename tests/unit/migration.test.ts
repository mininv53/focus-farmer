import { describe, expect, it } from 'vitest';
import { migrate } from '@/lib/persistence/migrations';
import { SCHEMA_VERSION } from '@/lib/persistence/schema';

describe('migrations', () => {
  it('produces a valid current-shape save from empty input', () => {
    const out = migrate({}, SCHEMA_VERSION);
    expect(out.version).toBe(SCHEMA_VERSION);
    expect(out.plantedCrops).toEqual([]);
    expect(out.inventory).toEqual([]);
    expect(out.unlockedSpecies).toContain('carrot');
    expect(out.unlockedSpecies).toContain('wheat');
    expect(out.seedlight).toBe(0);
  });

  it('drops legacy v1 spirits/resources fields and seeds defaults', () => {
    const legacy = {
      version: 1,
      spirits: [{ id: 'foo' }],
      resources: { motes: 999 },
      sessions: [],
      streak: { current: 0, longest: 0, lastActiveDay: null },
      badges: [],
    };
    const out = migrate(legacy, SCHEMA_VERSION);
    expect(out.version).toBe(SCHEMA_VERSION);
    expect((out as unknown as { spirits?: unknown }).spirits).toBeUndefined();
    expect((out as unknown as { resources?: unknown }).resources).toBeUndefined();
    expect(out.plantedCrops).toEqual([]);
    expect(out.inventory).toEqual([]);
  });
});
