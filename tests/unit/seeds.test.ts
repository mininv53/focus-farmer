import { describe, expect, it } from 'vitest';
import { rollSeedsForSession, seedsFromSession } from '@/lib/garden/seeds';

describe('seeds', () => {
  it('5 minutes plants 1 seed', () => {
    expect(seedsFromSession(5)).toBe(1);
  });

  it('15 minutes plants 2 seeds', () => {
    expect(seedsFromSession(15)).toBe(2);
  });

  it('25 minutes plants 3 seeds', () => {
    expect(seedsFromSession(25)).toBe(3);
  });

  it('45+ minutes plants 5 seeds', () => {
    expect(seedsFromSession(45)).toBe(5);
    expect(seedsFromSession(90)).toBe(5);
  });

  it('falls back to defaults if unlocked list is empty', () => {
    const seeds = rollSeedsForSession({
      durationMinutes: 25,
      unlockedSpecies: [],
    });
    expect(seeds).toHaveLength(3);
    for (const s of seeds) {
      expect(['carrot', 'wheat']).toContain(s.speciesId);
      expect(s.tier).toBe('common');
    }
  });

  it('only picks from unlocked species', () => {
    const seeds = rollSeedsForSession({
      durationMinutes: 45,
      unlockedSpecies: ['pumpkin'],
      rng: () => 0.5,
    });
    expect(seeds).toHaveLength(5);
    for (const s of seeds) expect(s.speciesId).toBe('pumpkin');
  });
});
