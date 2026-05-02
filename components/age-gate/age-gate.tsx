'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRealmStore } from '@/lib/store/realm-store';

/**
 * Soft age gate. We do not target users under 14 in the EU/UK design code sense;
 * users self-attest and we set a flag in their LocalStorage. No PII collected.
 */
export function AgeGate() {
  const hydrated = useRealmStore((s) => s.hydrated);
  const ageVerified = useRealmStore((s) => s.settings.ageVerified);
  const updateSettings = useRealmStore((s) => s.updateSettings);
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-realm-midnight/60 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl border border-realm-ink/15 bg-realm-parchment p-6 shadow-2xl dark:border-white/10 dark:bg-realm-midnight">
        <h2 id="age-gate-title" className="text-xl font-semibold tracking-tight">
          one quick thing
        </h2>
        <p className="mt-3 text-sm text-realm-ink/70 dark:text-realm-parchment/70">
          Focus Realm is built for ages <strong>14 and up</strong>. We never collect personal
          information and we have no ads, no random paid loot boxes, and no streak penalties.
        </p>
        <p className="mt-2 text-sm text-realm-ink/70 dark:text-realm-parchment/70">
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
