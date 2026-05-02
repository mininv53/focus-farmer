'use client';

import { useEffect } from 'react';
import { useRealmStore } from '@/lib/store/realm-store';

/**
 * Reads stored theme preference and applies the `dark` class on <html>.
 * Lives in <body> so the document is mounted by the time we run.
 */
export function ThemeBootstrap() {
  const hydrate = useRealmStore((s) => s.hydrate);
  const theme = useRealmStore((s) => s.settings.theme);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const root = document.documentElement;
    const apply = (t: 'light' | 'dark' | 'system') => {
      let dark = t === 'dark';
      if (t === 'system') {
        dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      root.classList.toggle('dark', dark);
    };
    apply(theme);
    if (theme === 'system') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      const onChange = () => apply('system');
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }
  }, [theme]);

  return null;
}
