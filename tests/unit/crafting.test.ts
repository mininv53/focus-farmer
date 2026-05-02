import { describe, expect, it } from 'vitest';
import { canUpgrade, rollUpgrade } from '@/lib/garden/crafting';

describe('crafting', () => {
  it('cannot upgrade past mythic', () => {
    expect(canUpgrade('mythic')).toBe(false);
    const r = rollUpgrade({ fromTier: 'mythic' });
    expect(r.toTier).toBeNull();
  });

  it('weighted distribution from common roughly matches the table', () => {
    // pass: 0.7, jumpOne: 0.22, jumpTwo: 0.07, jumpThree: 0.01
    const counts = { rare: 0, epic: 0, legendary: 0, mythic: 0 };
    for (let i = 0; i < 5000; i++) {
      const r = rollUpgrade({ fromTier: 'common' });
      if (r.toTier) (counts as Record<string, number>)[r.toTier] += 1;
    }
    expect(counts.rare).toBeGreaterThan(3000);
    expect(counts.epic).toBeGreaterThan(800);
    expect(counts.legendary).toBeGreaterThan(150);
    // mythic is rare but should appear at 5000 trials
    expect(counts.mythic).toBeGreaterThanOrEqual(1);
  });

  it('rng injection is deterministic', () => {
    const result = rollUpgrade({ fromTier: 'common', rng: () => 0.0 });
    expect(result.toTier).toBe('rare');
    const big = rollUpgrade({ fromTier: 'common', rng: () => 0.999 });
    expect(big.toTier).toBe('mythic');
  });

  it('rare upgrades to epic most of the time', () => {
    let epicCount = 0;
    for (let i = 0; i < 1000; i++) {
      const r = rollUpgrade({ fromTier: 'rare' });
      if (r.toTier === 'epic') epicCount += 1;
    }
    expect(epicCount).toBeGreaterThan(600);
  });

  it('legendary always becomes mythic', () => {
    for (let i = 0; i < 50; i++) {
      const r = rollUpgrade({ fromTier: 'legendary' });
      expect(r.toTier).toBe('mythic');
    }
  });
});
