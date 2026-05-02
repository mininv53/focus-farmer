'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGardenStore } from '@/lib/store/garden-store';

/**
 * Soft age gate. We do not target users under 14 in the EU/UK design code sense;
 * users self-attest and we set a flag in their LocalStorage. No PII collected.
 */
export function AgeGate() {
  const hydrated = useGardenStore((s) => s.hydrated);
  const ageVerified = useGardenStore((s) => s.settings.ageVerified);
  const updateSettings = useGardenStore((s) => s.updateSettings);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    setOpen(!ageVerified);
  }, [hydrated, ageVerified]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-garden-night/60 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl border border-garden-loam/15 bg-garden-cream p-6 shadow-2xl dark:border-white/10 dark:bg-garden-night">
        <h2 id="age-gate-title" className="text-xl font-semibold tracking-tight">
          one quick thing
        </h2>
        <p className="mt-3 text-sm text-garden-loam/70 dark:text-garden-cream/70">
          Focus Garden is built for ages <strong>14 and up</strong>. We never collect personal
          information and we have no ads, no random paid loot boxes, and no streak penalties.
        </p>
        <p className="mt-2 text-sm text-garden-loam/70 dark:text-garden-cream/70">
          By continuing you confirm you are at least 14 years old.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            onClick={() => {
              window.location.href = 'https://www.commonsensemedia.org/';
            }}
          >
            I&apos;m younger
          </Button>
          <Button
            onClick={() => {
              updateSettings({ ageVerified: true });
              setOpen(false);
            }}
          >
            I&apos;m 14 or older
          </Button>
        </div>
      </div>
    </div>
  );
}
