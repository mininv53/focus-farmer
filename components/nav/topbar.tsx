'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

const links = [
  { href: '/play', label: 'Realm' },
  { href: '/stats', label: 'Stats' },
  { href: '/settings', label: 'Settings' },
];

export function Topbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-realm-ink/10 bg-realm-parchment/80 backdrop-blur dark:border-white/10 dark:bg-realm-midnight/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight">
          <span className="text-realm-dusk dark:text-realm-legendary">focus</span> realm
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm transition-colors',
                pathname === l.href
                  ? 'bg-realm-dusk/10 text-realm-dusk dark:bg-white/10 dark:text-realm-legendary'
                  : 'text-realm-ink/70 hover:bg-black/5 dark:text-realm-parchment/70 dark:hover:bg-white/5',
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
