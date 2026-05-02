'use client';

import { useEffect } from 'react';
import { Topbar } from '@/components/nav/topbar';
import { SettingsForm } from '@/components/settings/settings-form';
import { useGardenStore } from '@/lib/store/garden-store';

export default function SettingsPage() {
  const hydrate = useGardenStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <>
      <Topbar />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight text-garden-loam dark:text-garden-cream">
            settings
          </h1>
          <p className="mt-1 text-sm text-garden-loam/70 dark:text-garden-cream/70">
            Your data lives in your browser. No accounts. No tracking.
          </p>
        </header>
        <SettingsForm />
      </main>
    </>
  );
}
