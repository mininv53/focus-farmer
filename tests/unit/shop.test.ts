import { describe, expect, it } from 'vitest';
import { buildShop, canPurchase } from '@/lib/garden/shop';

describe('shop', () => {
  it('default species are unlocked at start', () => {
    const shop = buildShop({
      completedSessions: 0,
      unlockedSpecies: ['carrot', 'wheat'],
      seedlight: 0,
    });
    const carrot = shop.find((o) => o.id === 'carrot');
    const wheat = shop.find((o) => o.id === 'wheat');
    expect(carrot?.unlocked).toBe(true);
    expect(wheat?.unlocked).toBe(true);
  });

  it('locks species behind progression', () => {
    const r = canPurchase({
      speciesId: 'pumpkin',
      completedSessions: 0,
      unlockedSpecies: [],
      seedlight: 9999,
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('sessions-required');
  });

  it('rejects if seedlight insufficient', () => {
    const r = canPurchase({
      speciesId: 'strawberry',
      completedSessions: 50,
      unlockedSpecies: ['carrot'],
      seedlight: 1,
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('not-enough-seedlight');
  });

  it('passes when player meets all gates', () => {
    const r = canPurchase({
      speciesId: 'strawberry',
      completedSessions: 5,
      unlockedSpecies: ['carrot'],
      seedlight: 100,
    });
    expect(r.ok).toBe(true);
  });

  it('rejects if already unlocked', () => {
    const r = canPurchase({
      speciesId: 'carrot',
      completedSessions: 5,
      unlockedSpecies: ['carrot'],
      seedlight: 100,
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('already-unlocked');
  });
});
