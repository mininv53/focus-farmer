'use client';

import { useEffect } from 'react';
import { Topbar } from '@/components/nav/topbar';
import { SettingsForm } from '@/components/settings/settings-form';
import { useRealmStore } from '@/lib/store/realm-store';

export default function SettingsPage() {
  const hydrate = useRealmStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <>
      <Topbar />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">settings</h1>
          <p className="mt-1 text-sm text-realm-ink/70 dark:text-realm-parchment/70">
            Your data lives in your browser. No accounts. No tracking.
          </p>
        </header>
        <SettingsForm />
      </main>
    </>
  );
}
