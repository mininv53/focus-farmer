import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(167,139,250,0.18),transparent_60%)]"
      />
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-16 text-center">
        <span className="rounded-full border border-realm-ink/15 px-3 py-1 text-xs uppercase tracking-widest text-realm-ink/60 dark:border-white/15 dark:text-realm-parchment/60">
          a tiny pixel realm for ages 14+
        </span>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">
          your focus summons{' '}
          <span className="bg-gradient-to-r from-realm-dusk via-realm-rare to-realm-legendary bg-clip-text text-transparent">
            spirits
          </span>
          .
        </h1>
        <p className="mt-6 max-w-xl text-base text-realm-ink/75 dark:text-realm-parchment/75 sm:text-lg">
          A focus timer that grows a tiny realm. Real focus summons spirits who keep working while
          you study. No shame, no streak penalties, no random paid loot boxes.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/play">
            <Button size="lg">enter realm — no signup</Button>
          </Link>
          <Link href="/stats">
            <Button size="lg" variant="secondary">
              see stats
            </Button>
          </Link>
        </div>

        <ul className="mt-16 grid w-full max-w-3xl grid-cols-1 gap-4 text-left text-sm sm:grid-cols-3">
          {FEATURES.map((f) => (
            <li
              key={f.title}
              className="rounded-2xl border border-realm-ink/10 bg-white/60 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5"
            >
              <div className="text-xl">{f.emoji}</div>
              <div className="mt-2 font-medium">{f.title}</div>
              <p className="mt-1 text-xs text-realm-ink/70 dark:text-realm-parchment/70">
                {f.desc}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-12 max-w-md text-xs text-realm-ink/50 dark:text-realm-parchment/50">
          Built around the{' '}
          <Link href="/age-appropriate" className="underline">
            UK Age Appropriate Design Code
          </Link>
          . Read our{' '}
          <Link href="/privacy" className="underline">
            privacy notes
          </Link>
          .
        </p>
      </div>
    </main>
  );
}

const FEATURES = [
  {
    emoji: '🌱',
    title: 'real focus, real growth',
    desc: 'Each completed session summons a spirit. They stay forever. They never wilt.',
  },
  {
    emoji: '🌌',
    title: 'idle while you study',
    desc: 'Your spirits gather motes, ore and herbs while you’re away. Capped at 8 hours so it’s never a treadmill.',
  },
  {
    emoji: '🛡',
    title: 'safe by default',
    desc: 'No accounts, no ads, no paid randomness. Your data stays in your browser.',
  },
];
