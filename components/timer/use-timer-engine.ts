'use client';

import { useEffect, useRef } from 'react';
import { useTimerStore } from '@/lib/store/timer-store';
import { useGardenStore } from '@/lib/store/garden-store';
import { isExpired } from '@/lib/focus/timer';
import { sfx } from '@/lib/audio/synth';
import type { PlantedCrop } from '@/lib/persistence/schema';

export interface CompletionEvent {
  planted: PlantedCrop[];
  autoHarvested: PlantedCrop[];
}

export interface TimerEngineCallbacks {
  onComplete?: (e: CompletionEvent) => void;
}

/**
 * Watches the timer; when expired, completes the session and plants seeds.
 * Should be mounted ONCE per page that owns the timer (the /play page).
 */
export function useTimerEngine(cb: TimerEngineCallbacks = {}) {
  const timer = useTimerStore((s) => s.timer);
  const markCompleted = useTimerStore((s) => s.markCompleted);
  const completeSession = useGardenStore((s) => s.completeSession);
  const recordAbortedSession = useGardenStore((s) => s.recordAbortedSession);
  const audioEnabled = useGardenStore((s) => s.settings.audioEnabled);

  const onCompleteRef = useRef(cb.onComplete);
  useEffect(() => {
    onCompleteRef.current = cb.onComplete;
  }, [cb.onComplete]);

  useEffect(() => {
    if (timer.status !== 'running' && timer.status !== 'paused') return;
    const tick = () => {
      const now = Date.now();
      if (isExpired(timer, now)) {
        markCompleted();
        const outcome = completeSession(timer.durationSec, timer.durationSec, now);
        if (audioEnabled) sfx.complete();
        if (outcome.planted.length > 0 && audioEnabled) sfx.summon();
        onCompleteRef.current?.(outcome);
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
