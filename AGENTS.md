# AGENTS.md

Conventions for humans and agents working on this repo.

## Setup

```bash
npm install
npm run dev
```

Node 20+ recommended.

## Required checks before a PR

```bash
npm run lint
npm run typecheck
npm run format:check
npm test
npm run build
```

CI runs all five and fails on any one of them.

## Code style

- TypeScript strict mode, **no `any`**, no `getattr/setattr`-style escape hatches.
- Components live in `components/<domain>/`, not co-located with pages.
- Pure logic lives under `lib/`; never import React from `lib/` (except `lib/store/` and `lib/audio/synth.ts` which are explicitly browser-only).
- Use the existing `cn()` helper for conditional classes; do not inline `clsx`.
- Prefer Tailwind tokens defined in `tailwind.config.ts` over arbitrary hex.
- New persistent state must be added to `lib/persistence/schema.ts` with a corresponding migration.
- Three.js / r3f scenes never directly read the Zustand stores from inside `useFrame`/animation loops in a way that re-renders every tick. Subscribe at the React layer and push the latest values down via props.

## Tests

- Unit tests live in `tests/unit/` and run in `jsdom`.
- Test pure functions, RNG (with injected `rng`), and store reducers.
- Do not write tests that mount the Three.js canvas — keep that for Playwright in stage 2+.

## Branch / PR conventions

- Branch names: `devin/<unix>-<slug>` for agents, otherwise `feat/...`, `fix/...`, `chore/...`.
- PR description must cover: what changed, why, and screenshots if visual.
- Keep PRs focused; do not mix refactors with features.

## Game design rails (do not violate without an explicit ADR)

- No paid randomness. Cosmetics only, never random rolls behind a paywall.
- No streak penalties or shame loops. Bad days are silent.
- No FOMO timers. Limited-time offers are banned in this product.
- Offline crop growth is capped (`OFFLINE_GROWTH_CAP_HOURS` in `lib/garden/catalog.ts`).
- All copy must be supportive, never parental or guilt-trippy.
