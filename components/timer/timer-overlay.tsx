'use client';

import { useEffect, useState } from 'react';
import { useTimerStore } from '@/lib/store/timer-store';
import { elapsedSec, formatMMSS, remainingSec } from '@/lib/focus/timer';

export function TimerOverlay() {
  const timer = useTimerStore((s) => s.timer);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (timer.status !== 'running' && timer.status !== 'paused') return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [timer.status]);

  const remaining = remainingSec(timer, now);
  const elapsed = elapsedSec(timer, now);
  const total = timer.durationSec || 1;
  const ratio = Math.min(1, elapsed / total);

  if (timer.status === 'idle') return null;

  return (
    <div className="rounded-2xl border border-realm-ink/10 bg-white/70 p-6 backdrop-blur dark:border-white/10 dark:bg-white/5">
      <div className="flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-widest text-realm-ink/60 dark:text-realm-parchment/60">
          {timer.status === 'paused'
            ? 'paused'
            : timer.status === 'completed'
              ? 'complete'
              : timer.status === 'aborted'
                ? 'ended early'
                : 'focusing'}
        </span>
        <span className="text-xs text-realm-ink/60 dark:text-realm-parchment/60">
          {Math.round(elapsed)}/{Math.round(total)} sec
        </span>
      </div>
      <div className="mt-3 font-mono text-5xl font-semibold tabular-nums">
        {formatMMSS(remaining)}
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-realm-ink/10 dark:bg-white/10">
        <div
          aria-hidden
          className="h-full bg-realm-dusk transition-all duration-300 dark:bg-realm-legendary"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}
