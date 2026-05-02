'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { SessionRecord } from '@/lib/persistence/schema';
import { bucketByDay, lastNDays } from '@/lib/stats/aggregates';

interface Props {
  sessions: SessionRecord[];
  days?: number;
}

export function FocusChart({ sessions, days = 7 }: Props) {
  const buckets = bucketByDay(sessions);
  const data = lastNDays(days).map((d) => ({
    day: d.slice(5),
    minutes: Math.round((buckets.get(d)?.focusedMinutes ?? 0) * 10) / 10,
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            cursor={{ fill: 'rgba(91, 58, 133, 0.1)' }}
            contentStyle={{
              borderRadius: 8,
              fontSize: 12,
              border: '1px solid rgba(0,0,0,0.1)',
            }}
          />
          <Bar dataKey="minutes" fill="#5b3a85" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
