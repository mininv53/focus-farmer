'use client';

import { useEffect, useRef } from 'react';
import { useTimerStore } from '@/lib/store/timer-store';
import { useRealmStore } from '@/lib/store/realm-store';
import { isExpired } from '@/lib/focus/timer';
import { sfx } from '@/lib/audio/synth';

export interface SummonEvent {
  spiritId: string;
  speciesId: string;
  rarity: 'common' | 'rare' | 'legendary';
  plotIndex: number;
  displayName: string;
}

export interface TimerEngineCallbacks {
  onSummon?: (e: SummonEvent) => void;
}

/**
 * Watches the timer; when expired, completes the session and rolls a spirit.
 * Should be mounted ONCE per page that owns the timer (the /play page).
 */
export function useTimerEngine(cb: TimerEngineCallbacks = {}) {
  const timer = useTimerStore((s) => s.timer);
  const markCompleted = useTimerStore((s) => s.markCompleted);
  const completeSession = useRealmStore((s) => s.completeSession);
  const recordAbortedSession = useRealmStore((s) => s.recordAbortedSession);
  const audioEnabled = useRealmStore((s) => s.settings.audioEnabled);

  const onSummonRef = useRef(cb.onSummon);
  useEffect(() => {
    onSummonRef.current = cb.onSummon;
  }, [cb.onSummon]);

  useEffect(() => {
    if (timer.status !== 'running' && timer.status !== 'paused') return;
    const tick = () => {
      const now = Date.now();
      if (isExpired(timer, now)) {
        markCompleted();
        const summoned = completeSession(timer.durationSec, timer.durationSec, now);
        if (audioEnabled) sfx.complete();
        if (summoned) {
          if (audioEnabled) sfx.summon();
          onSummonRef.current?.({
            spiritId: summoned.id,
            speciesId: summoned.speciesId,
            rarity: summoned.rarity,
            plotIndex: summoned.plotIndex,
            displayName: summoned.displayName,
          });
        }
      }
    };
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [timer, markCompleted, completeSession, audioEnabled]);

  // Persist aborted session once user explicitly ends.
  useEffect(() => {
    if (timer.status !== 'aborted') return;
    recordAbortedSession(timer.durationSec, Math.round(timer.accumulatedSec));
  }, [timer.status, timer.durationSec, timer.accumulatedSec, recordAbortedSession]);
}
