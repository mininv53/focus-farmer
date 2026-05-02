'use client';

import { BadgeUnlock } from '@/lib/persistence/schema';

const CATALOG: Record<BadgeUnlock['id'], { label: string; description: string; emoji: string }> = {
  '7-day-streak': { label: '7-day streak', description: 'one week of showing up', emoji: '🌱' },
  '30-day-streak': { label: '30-day streak', description: 'a month of consistency', emoji: '🌳' },
  '100-day-streak': { label: '100-day streak', description: 'rare focus', emoji: '✨' },
  'first-spirit': { label: 'first spirit', description: 'you summoned your first', emoji: '🪄' },
  'first-rare': { label: 'first rare', description: 'a rare arrived', emoji: '🔮' },
  'first-legendary': { label: 'first legendary', description: 'a legend awakens', emoji: '🌌' },
};

const ALL_IDS: BadgeUnlock['id'][] = [
  'first-spirit',
  '7-day-streak',
  'first-rare',
  '30-day-streak',
  'first-legendary',
  '100-day-streak',
];

interface Props {
  badges: BadgeUnlock[];
}

export function StreakBadges({ badges }: Props) {
  const unlocked = new Set(badges.map((b) => b.id));
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {ALL_IDS.map((id) => {
        const info = CATALOG[id];
        const isUnlocked = unlocked.has(id);
        return (
          <li
            key={id}
            className={`rounded-xl border p-3 text-sm ${
              isUnlocked
                ? 'border-realm-legendary/40 bg-realm-legendary/10 text-realm-ink dark:text-realm-parchment'
                : 'border-realm-ink/10 bg-black/5 text-realm-ink/40 dark:border-white/10 dark:bg-white/5 dark:text-realm-parchment/40'
            }`}
          >
            <div className="text-2xl">{info.emoji}</div>
            <div className="mt-1 font-medium">{info.label}</div>
            <div className="text-xs opacity-70">{info.description}</div>
          </li>
        );
      })}
    </ul>
  );
}
