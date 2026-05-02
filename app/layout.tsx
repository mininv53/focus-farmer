import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeBootstrap } from '@/components/nav/theme-bootstrap';

export const metadata: Metadata = {
  title: 'Focus Garden — plant focus, harvest crops',
  description:
    'A focus timer that grows a tiny pixel garden. Real focus plants seeds; crops ripen on their own clock; combine 5 of a kind for a chance at rare → mythic. No shame, no dark patterns.',
  applicationName: 'Focus Garden',
  authors: [{ name: 'Focus Garden Team' }],
  keywords: ['focus', 'pomodoro', 'productivity', 'farm game', 'pixel art', 'study'],
  openGraph: {
    title: 'Focus Garden',
    description: 'Plant focus. Harvest crops. Combine for rare tiers.',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f4ea' },
    { media: '(prefers-color-scheme: dark)', color: '#260c45' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeBootstrap />
        {children}
      </body>
    </html>
  );
}
