import { ResourceLedger, SpiritInstance } from '@/lib/persistence/schema';
import { IDLE_CAP_HOURS, SPIRIT_BY_ID, ResourceKey } from './catalog';

export interface IdleTickResult {
  /** New ledger reflecting accrual. */
  ledger: ResourceLedger;
  /** Updated spirits with refreshed lastHarvestedAt. */
  spirits: SpiritInstance[];
  /** Per-resource gained amounts since last tick. */
  gained: ResourceLedger;
  /** Wall-clock minutes that were credited (capped). */
  minutesCredited: number;
}

const IDLE_CAP_MS = IDLE_CAP_HOURS * 60 * 60 * 1000;

/**
 * Compute idle production accumulated since each spirit's last harvest.
 * - Caps at IDLE_CAP_HOURS so leaving for a week doesn't give absurd amounts
 *   (without punishing the user — they still get the cap).
 * - Pure function: takes/returns immutable data.
 */
export function tickIdle(
  spirits: SpiritInstance[],
  ledger: ResourceLedger,
  now: number,
): IdleTickResult {
  const gained: ResourceLedger = { motes: 0, ore: 0, herbs: 0, artifacts: 0 };
  let minutesCredited = 0;

  const updated = spirits.map((s) => {
    const species = SPIRIT_BY_ID[s.speciesId];
    if (!species) return s;
    const elapsedMs = Math.max(0, now - s.lastHarvestedAt);
    const cappedMs = Math.min(elapsedMs, IDLE_CAP_MS);
    const minutes = cappedMs / 60000;
    minutesCredited = Math.max(minutesCredited, minutes);

    (Object.entries(species.yieldsPerMinute) as [ResourceKey, number][]).forEach(([k, v]) => {
      gained[k] += v * minutes;
    });

    return { ...s, lastHarvestedAt: now };
  });

  const nextLedger: ResourceLedger = {
    motes: ledger.motes + gained.motes,
    ore: ledger.ore + gained.ore,
    herbs: ledger.herbs + gained.herbs,
    artifacts: ledger.artifacts + gained.artifacts,
  };

  return {
    ledger: nextLedger,
    spirits: updated,
    gained,
    minutesCredited,
  };
}

export function formatResourceGain(gained: ResourceLedger): string {
  const parts: string[] = [];
  if (gained.motes >= 0.5) parts.push(`${Math.floor(gained.motes)} motes`);
  if (gained.ore >= 0.5) parts.push(`${Math.floor(gained.ore)} ore`);
  if (gained.herbs >= 0.5) parts.push(`${Math.floor(gained.herbs)} herbs`);
  if (gained.artifacts >= 1) parts.push(`${Math.floor(gained.artifacts)} artifact(s)`);
  return parts.join(', ');
}
