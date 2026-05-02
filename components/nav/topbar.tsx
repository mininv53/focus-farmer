'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

const links = [
  { href: '/play', label: 'Garden' },
  { href: '/stats', label: 'Stats' },
  { href: '/settings', label: 'Settings' },
];

export function Topbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-garden-loam/10 bg-garden-cream/80 backdrop-blur dark:border-white/10 dark:bg-garden-night/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="font-semibold tracking-tight text-garden-loam dark:text-garden-cream"
        >
          <span className="text-garden-stem dark:text-garden-legendary">focus</span> garden
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm transition-colors',
                pathname === l.href
                  ? 'bg-garden-stem/15 text-garden-stem dark:bg-white/10 dark:text-garden-legendary'
                  : 'text-garden-loam/70 hover:bg-black/5 dark:text-garden-cream/70 dark:hover:bg-white/5',
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
