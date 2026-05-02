import { describe, expect, it } from 'vitest';
import { rarityWeights, rollSpirit } from '@/lib/spirits/rng';

describe('rarity weights', () => {
  it('5-min sessions favour common, allow rare/legendary', () => {
    const w = rarityWeights(5);
    expect(w.common).toBeGreaterThan(w.rare);
    expect(w.rare).toBeGreaterThan(w.legendary);
    expect(w.legendary).toBeGreaterThan(0);
  });

  it('45-min sessions raise rare/legendary odds', () => {
    const short = rarityWeights(5);
    const deep = rarityWeights(45);
    expect(deep.rare).toBeGreaterThan(short.rare);
    expect(deep.legendary).toBeGreaterThan(short.legendary);
  });
});

describe('rollSpirit', () => {
  it('always returns a defined spirit even at extreme rng=0', () => {
    const s = rollSpirit({
      durationMinutes: 25,
      completedSessionCount: 0,
      rng: () => 0,
    });
    expect(s).toBeTruthy();
    expect(s.rarity).toBe('common');
  });

  it('legendary path requires unlocks', () => {
    // Force legendary by selecting top of weight band, but with 0 sessions completed
    // legendaries are still gated. Falls back to common.
    const s = rollSpirit({
      durationMinutes: 45,
      completedSessionCount: 0,
      rng: () => 0.999,
    });
    expect(['common', 'rare']).toContain(s.rarity);
  });

  it('legendary unlocks after enough sessions', () => {
    const s = rollSpirit({
      durationMinutes: 45,
      completedSessionCount: 100,
      rng: () => 0.999,
    });
    expect(s.rarity).toBe('legendary');
  });
});
