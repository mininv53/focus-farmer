import { describe, expect, it } from 'vitest';
import { tickIdle } from '@/lib/spirits/idle';
import type { ResourceLedger, SpiritInstance } from '@/lib/persistence/schema';
import { IDLE_CAP_HOURS } from '@/lib/spirits/catalog';

const T0 = 1_700_000_000_000;
const baseLedger = (): ResourceLedger => ({ motes: 0, ore: 0, herbs: 0, artifacts: 0 });
const mkSpirit = (over: Partial<SpiritInstance> = {}): SpiritInstance => ({
  id: 's1',
  speciesId: 'pip-sprout',
  rarity: 'common',
  plotIndex: 0,
  summonedAt: T0,
  lastHarvestedAt: T0,
  displayName: 'Pip',
  ...over,
});

describe('idle accrual', () => {
  it('accrues motes for a common spirit over time', () => {
    const result = tickIdle([mkSpirit()], baseLedger(), T0 + 60 * 1000);
    expect(result.gained.motes).toBeCloseTo(1.0, 2);
    expect(result.ledger.motes).toBeCloseTo(1.0, 2);
    expect(result.spirits[0].lastHarvestedAt).toBe(T0 + 60 * 1000);
  });

  it('caps accumulation at the configured horizon', () => {
    const past = T0;
    const longLater = past + 10 * 60 * 60 * 1000; // 10 hours
    const result = tickIdle([mkSpirit({ lastHarvestedAt: past })], baseLedger(), longLater);
    const expectedMaxMinutes = IDLE_CAP_HOURS * 60;
    expect(result.gained.motes).toBeCloseTo(expectedMaxMinutes * 1.0, 1);
  });

  it('preserves existing ledger and adds onto it', () => {
    const existing = { motes: 5, ore: 2, herbs: 1, artifacts: 0 };
    const result = tickIdle([mkSpirit()], existing, T0 + 60 * 1000);
    expect(result.ledger.motes).toBeCloseTo(6.0, 2);
    expect(result.ledger.ore).toBe(2);
  });

  it('handles unknown species gracefully', () => {
    const s = mkSpirit({ speciesId: 'ghost' });
    const result = tickIdle([s], baseLedger(), T0 + 600_000);
    expect(result.gained.motes).toBe(0);
  });
});
