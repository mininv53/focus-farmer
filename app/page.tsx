import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(192,185,221,0.35),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(209,138,117,0.25),transparent_60%)]"
      />
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-16 text-center">
        <span className="rounded-full border border-garden-loam/15 bg-white/60 px-3 py-1 text-xs uppercase tracking-widest text-garden-loam/70 dark:border-white/15 dark:bg-white/5 dark:text-garden-cream/70">
          a tiny pixel garden for ages 14+
        </span>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-garden-loam dark:text-garden-cream sm:text-6xl">
          plant focus,{' '}
          <span className="bg-gradient-to-r from-garden-stem via-garden-rare to-garden-legendary bg-clip-text text-transparent">
            harvest crops
          </span>
          .
        </h1>
        <p className="mt-6 max-w-xl text-base text-garden-loam/75 dark:text-garden-cream/75 sm:text-lg">
          A focus timer that grows a tiny pixel garden. Real focus plants seeds. Crops ripen on
          their own clock. Combine five of a kind for a chance at rare, epic, legendary or mythic.
          No shame, no streak penalties, no paid randomness.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/play">
            <Button size="lg">enter the garden — no signup</Button>
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
              className="rounded-2xl border border-garden-loam/10 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5"
            >
              <div className="text-xl">{f.emoji}</div>
              <div className="mt-2 font-medium text-garden-loam dark:text-garden-cream">
                {f.title}
              </div>
              <p className="mt-1 text-xs text-garden-loam/70 dark:text-garden-cream/70">{f.desc}</p>
            </li>
          ))}
        </ul>

        <p className="mt-12 max-w-md text-xs text-garden-loam/55 dark:text-garden-cream/55">
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
    desc: 'Each focus session plants seeds. Crops grow on a wall-clock — even when you close the tab.',
  },
  {
    emoji: '🍓',
    title: 'harvest & combine',
    desc: 'Tap ripe crops to harvest. Stack five of a kind to roll a chance at rare → mythic.',
  },
  {
    emoji: '🛡',
    title: 'safe by default',
    desc: 'No accounts, no ads, no paid randomness, no shame loops. Your data stays in your browser.',
  },
];
