'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DURATION_PRESETS, DEFAULT_PRESET_ID } from '@/lib/focus/presets';
import { useTimerStore } from '@/lib/store/timer-store';
import { useGardenStore } from '@/lib/store/garden-store';
import { sfx } from '@/lib/audio/synth';

export function TimerControls() {
  const [presetId, setPresetId] = useState(DEFAULT_PRESET_ID);
  const status = useTimerStore((s) => s.timer.status);
  const start = useTimerStore((s) => s.start);
  const pause = useTimerStore((s) => s.pause);
  const resume = useTimerStore((s) => s.resume);
  const abort = useTimerStore((s) => s.abort);
  const audioEnabled = useGardenStore((s) => s.settings.audioEnabled);

  const preset = DURATION_PRESETS.find((p) => p.id === presetId) ?? DURATION_PRESETS[2];

  if (status === 'idle' || status === 'completed' || status === 'aborted') {
    return (
      <div className="flex flex-col gap-3">
        <div role="radiogroup" aria-label="Session length" className="flex flex-wrap gap-2">
          {DURATION_PRESETS.map((p) => (
            <button
              key={p.id}
              role="radio"
              aria-checked={presetId === p.id}
              onClick={() => setPresetId(p.id)}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                presetId === p.id
                  ? 'bg-garden-loam text-garden-cream'
                  : 'border border-garden-loam/15 text-garden-loam hover:bg-black/5 dark:border-white/15 dark:text-garden-cream dark:hover:bg-white/5'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <Button
          size="lg"
          onClick={() => {
            start(preset.minutes * 60);
            if (audioEnabled) sfx.start();
          }}
        >
          plant seeds · {preset.label}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === 'running' && (
        <Button variant="secondary" onClick={pause}>
          pause
        </Button>
      )}
      {status === 'paused' && <Button onClick={resume}>resume</Button>}
      <Button
        variant="ghost"
        onClick={() => {
          if (confirm('End this session early? No streak penalty — your garden stays as-is.')) {
            abort();
          }
        }}
      >
        end early
      </Button>
    </div>
  );
}
