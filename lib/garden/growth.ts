import type { PlantedCrop } from '@/lib/persistence/schema';
import { OFFLINE_GROWTH_CAP_HOURS, STAGE_COUNT, STAGE_SECONDS } from './catalog';

/**
 * A crop's runtime growth state, computed from wall-clock.
 * stage = 0 (just planted) ... STAGE_COUNT (mature, ready to harvest).
 */
export interface CropGrowth {
  stage: number;
  /** Progress through the *current* stage, 0..1. 1 means stage about to advance. */
  stageProgress: number;
  /** Whether stage === STAGE_COUNT, i.e. ready to harvest. */
  mature: boolean;
  /** Seconds until next stage (or until mature, if currently last growing stage). 0 if mature. */
  secondsToNextStage: number;
}

const CAP_SECONDS = OFFLINE_GROWTH_CAP_HOURS * 60 * 60;

/**
 * Compute the current growth state of a crop at time `now`.
 * Capped at OFFLINE_GROWTH_CAP_HOURS so leaving the game running for days
 * doesn't trivialize progression.
 */
export function growthFor(crop: PlantedCrop, now: number): CropGrowth {
  const elapsedSec = Math.max(0, Math.floor((now - crop.plantedAt) / 1000));
  const cappedSec = Math.min(elapsedSec, CAP_SECONDS);

  // Mature once we've passed STAGE_COUNT * STAGE_SECONDS.
  const matureAtSec = STAGE_COUNT * STAGE_SECONDS;
  if (cappedSec >= matureAtSec) {
    return { stage: STAGE_COUNT, stageProgress: 1, mature: true, secondsToNextStage: 0 };
  }

  const stage = Math.min(STAGE_COUNT - 1, Math.floor(cappedSec / STAGE_SECONDS));
  const intoStage = cappedSec - stage * STAGE_SECONDS;
  const stageProgress = Math.min(1, intoStage / STAGE_SECONDS);
  const secondsToNextStage = Math.max(0, STAGE_SECONDS - intoStage);
  return {
    stage: stage + 1, // 1..STAGE_COUNT growing visual; stage 0 is the bare seed flash
    stageProgress,
    mature: false,
    secondsToNextStage,
  };
}

/**
 * Group a list of crops by mature/growing for UI summaries.
 */
export function partitionByMaturity(
  crops: PlantedCrop[],
  now: number,
): { mature: PlantedCrop[]; growing: PlantedCrop[] } {
  const mature: PlantedCrop[] = [];
  const growing: PlantedCrop[] = [];
  for (const c of crops) {
    if (growthFor(c, now).mature) mature.push(c);
    else growing.push(c);
  }
  return { mature, growing };
}
