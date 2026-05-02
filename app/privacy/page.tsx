import Link from 'next/link';
import { Topbar } from '@/components/nav/topbar';

export default function PrivacyPage() {
  return (
    <>
      <Topbar />
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-8 text-sm leading-relaxed [&_a]:underline [&_a]:underline-offset-2 [&_h1]:mb-2 [&_h1]:mt-6 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p]:mt-2 [&_ul]:mt-2">
        <h1>Privacy</h1>
        <p>
          Focus Garden is designed to collect <strong>nothing</strong> about you in the MVP. Your
          crops, inventory, sessions, badges, and settings are stored entirely in this
          browser&apos;s <code>localStorage</code>. They never leave your device.
        </p>
        <h2>What we don&apos;t do</h2>
        <ul>
          <li>No accounts, no email, no name, no age verification beyond a self-attestation.</li>
          <li>No advertising, no behavioural tracking, no cross-site cookies.</li>
          <li>No paid loot boxes, no gambling-style randomness behind a paywall.</li>
          <li>No FOMO timers or shame mechanics.</li>
        </ul>
        <h2>Analytics</h2>
        <p>
          The MVP uses <strong>no analytics</strong>. If we later add analytics it will be a
          privacy-first, anonymous tool such as Plausible. We will publish the change in this page
          and a release note before turning it on.
        </p>
        <h2>Your data, your control</h2>
        <p>
          On the <Link href="/settings">Settings</Link> page you can export everything as JSON or
          erase the garden in one click.
        </p>
        <h2>Contact</h2>
        <p>
          For privacy questions email <code>privacy@focus-garden.app</code> (placeholder; replace
          before launch).
        </p>
      </main>
    </>
  );
}
