import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeBootstrap } from '@/components/nav/theme-bootstrap';

export const metadata: Metadata = {
  title: 'Focus Realm — your focus summons spirits',
  description:
    'A focus timer that grows a tiny pixel realm. Real focus summons spirits who keep working while you are away. No shame. No dark patterns.',
  applicationName: 'Focus Realm',
  authors: [{ name: 'Focus Realm Team' }],
  keywords: ['focus', 'pomodoro', 'productivity', 'idle game', 'pixel art', 'study'],
  openGraph: {
    title: 'Focus Realm',
    description: 'Your focus summons spirits. They work while you study.',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6efe1' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1530' },
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
