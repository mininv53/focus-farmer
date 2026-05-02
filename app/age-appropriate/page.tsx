import { Topbar } from '@/components/nav/topbar';

export default function AgeAppropriatePage() {
  return (
    <>
      <Topbar />
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-8 text-sm leading-relaxed [&_a]:underline [&_a]:underline-offset-2 [&_h1]:mb-2 [&_h1]:mt-6 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p]:mt-2 [&_ul]:mt-2">
        <h1>Age-appropriate design</h1>
        <p>
          Focus Realm is designed with young people in mind. Even though we self-attest to ages 14+,
          our design choices follow the{' '}
          <a href="https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/age-appropriate-design-code/">
            UK ICO Age Appropriate Design Code (AADC)
          </a>{' '}
          principles wherever they apply.
        </p>
        <h2>What this means concretely</h2>
        <ul>
          <li>
            <strong>Privacy by default.</strong> No personal data is collected, transmitted, or
            sold. Everything stays on the user&apos;s device.
          </li>
          <li>
            <strong>No dark patterns.</strong> No FOMO timers, scarcity countdowns, or shame loops.
            Streaks reset gently and badges are kept forever.
          </li>
          <li>
            <strong>No paid randomness.</strong> Paid mechanics will be cosmetic only and never
            random. Several jurisdictions classify paid loot boxes for minors as gambling — we
            don&apos;t go there.
          </li>
          <li>
            <strong>Detrimental content avoided.</strong> No targeted advertising, no chat with
            strangers in the MVP, no graphic content.
          </li>
          <li>
            <strong>Transparent data controls.</strong> Settings exposes export and reset in one
            tap.
          </li>
          <li>
            <strong>Best interests of the child.</strong> The product&apos;s core loop rewards
            real-world focus, not in-app engagement for its own sake. Idle accumulation is capped at
            8 hours so leaving the app is not punished.
          </li>
        </ul>
        <h2>Future paid features</h2>
        <p>
          When we add a paid layer it will: be cosmetic-only, never affect spirit production rates,
          require parental confirmation behind a PIN by default, and offer easy refunds. We will
          publish the policy here before charging anyone.
        </p>
      </main>
    </>
  );
}
