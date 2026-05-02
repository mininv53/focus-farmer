import { describe, expect, it } from 'vitest';
import { growthFor, partitionByMaturity } from '@/lib/garden/growth';
import { OFFLINE_GROWTH_CAP_HOURS, STAGE_COUNT, STAGE_SECONDS } from '@/lib/garden/catalog';
import type { PlantedCrop } from '@/lib/persistence/schema';

const crop = (plantedAt: number): PlantedCrop => ({
  id: 'c1',
  speciesId: 'carrot',
  tier: 'common',
  plotIndex: 0,
  plantedAt,
});

describe('growth', () => {
  it('starts at stage 1 just after planting', () => {
    const c = crop(0);
    const g = growthFor(c, 1000);
    expect(g.mature).toBe(false);
    expect(g.stage).toBe(1);
  });

  it('advances stages on STAGE_SECONDS boundaries', () => {
    const c = crop(0);
    const halfway = STAGE_SECONDS * 1000;
    const g = growthFor(c, halfway);
    expect(g.stage).toBe(2);
  });

  it('reaches mature after STAGE_COUNT * STAGE_SECONDS seconds', () => {
    const c = crop(0);
    const matureMs = STAGE_COUNT * STAGE_SECONDS * 1000;
    const g = growthFor(c, matureMs);
    expect(g.mature).toBe(true);
    expect(g.stage).toBe(STAGE_COUNT);
  });

  it('is capped by OFFLINE_GROWTH_CAP_HOURS', () => {
    const c = crop(0);
    const wayLater = (OFFLINE_GROWTH_CAP_HOURS + 100) * 3600 * 1000;
    const g = growthFor(c, wayLater);
    expect(g.mature).toBe(true);
  });

  it('partitionByMaturity splits planted crops correctly', () => {
    const now = STAGE_COUNT * STAGE_SECONDS * 1000;
    const a: PlantedCrop = { ...crop(0), id: 'a' };
    const b: PlantedCrop = { ...crop(now - 1), id: 'b' };
    const { mature, growing } = partitionByMaturity([a, b], now);
    expect(mature.map((c) => c.id)).toEqual(['a']);
    expect(growing.map((c) => c.id)).toEqual(['b']);
  });

  it('reports stageProgress between 0 and 1 mid-stage', () => {
    const c = crop(0);
    const halfStage = (STAGE_SECONDS / 2) * 1000;
    const g = growthFor(c, halfStage);
    expect(g.stageProgress).toBeGreaterThan(0);
    expect(g.stageProgress).toBeLessThan(1);
  });
});
