'use client';

import { Button } from '@/components/ui/button';
import { useRealmStore } from '@/lib/store/realm-store';
import { exportSave, clearSave } from '@/lib/persistence/storage';

export function SettingsForm() {
  const settings = useRealmStore((s) => s.settings);
  const updateSettings = useRealmStore((s) => s.updateSettings);
  const resetAll = useRealmStore((s) => s.resetAll);

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-base font-semibold">theme</h3>
        <p className="mt-1 text-sm text-realm-ink/70 dark:text-realm-parchment/70">
          Soft on the eyes. Or moody and dark.
        </p>
        <div className="mt-3 flex gap-2">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <button
              key={t}
              onClick={() => updateSettings({ theme: t })}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                settings.theme === t
                  ? 'bg-realm-dusk text-realm-parchment'
                  : 'border border-realm-ink/15 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold">audio</h3>
        <p className="mt-1 text-sm text-realm-ink/70 dark:text-realm-parchment/70">
          Subtle blips when sessions begin and spirits arrive. Off by default in libraries.
        </p>
        <label className="mt-3 inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.audioEnabled}
            onChange={(e) => updateSettings({ audioEnabled: e.target.checked })}
            className="h-4 w-4 rounded border-realm-ink/40 accent-realm-dusk"
          />
          <span className="text-sm">enable sound effects</span>
        </label>
      </section>

      <section>
        <h3 className="text-base font-semibold">daily reminder</h3>
        <p className="mt-1 text-sm text-realm-ink/70 dark:text-realm-parchment/70">
          A single, gentle reminder. Never a guilt trip. You can turn it off any time.
        </p>
        <label className="mt-3 inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.reminderEnabled}
            onChange={(e) => updateSettings({ reminderEnabled: e.target.checked })}
            className="h-4 w-4 rounded border-realm-ink/40 accent-realm-dusk"
          />
          <span className="text-sm">remind me once a day</span>
        </label>
        {settings.reminderEnabled && (
          <input
            type="time"
            value={settings.reminderTime ?? '09:00'}
            onChange={(e) => updateSettings({ reminderTime: e.target.value })}
            className="mt-2 block rounded-md border border-realm-ink/15 bg-transparent px-3 py-1.5 text-sm dark:border-white/15"
          />
        )}
      </section>

      <section>
        <h3 className="text-base font-semibold">your data</h3>
        <p className="mt-1 text-sm text-realm-ink/70 dark:text-realm-parchment/70">
          Everything stays in your browser. No account, no server. Export anytime.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              const data = exportSave();
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `focus-realm-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            export JSON
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (
                confirm(
                  'This will delete every spirit, session, and badge from this browser. There is no undo. Are you sure?',
                )
              ) {
                clearSave();
                resetAll();
              }
            }}
          >
            reset realm
          </Button>
        </div>
      </section>
    </div>
  );
}
