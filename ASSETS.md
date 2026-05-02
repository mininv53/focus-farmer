# ASSETS.md — drop your own art and audio here

The MVP ships with placeholder **procedurally generated pixel art** (drawn at
runtime by `lib/game/textures/farm.ts`) and **synthesized audio** (generated
by `lib/audio/synth.ts`). Replace either by dropping files into the paths
below — code will pick them up automatically once the loader hooks
described in this doc are wired up (TODOs marked below).

## Conventions

- All sprites are **pixel art**, integer-scaled (`image-rendering: pixelated`).
- Crop sprites are **32×32 px** with a transparent background.
- Tiles are **32×32 px**, opaque, designed to tile seamlessly horizontally
  _and_ vertically.
- Audio is `.mp3`, mono, 44.1 kHz, **−14 LUFS** target loudness, less than
  500 ms for one-shots and looping for ambient.

## Crop sprites

Drop these PNGs into `public/sprites/crops/`. To wire them up, add a
`load.image` call in a Phaser preload step that uses the same texture key as
the procedural fallback (e.g. `crop-carrot-3`) — the bundled file will win
over the procedural texture.

Each species has **5 stage frames** (0 = bare seed, 1 = sprout, 2 = leafing,
3 = budding, 4 = mature/ripe). Filenames use the pattern
`<species>-<stage>.png`.

| Filename                                       | Size  | Stage description                                  |
| ---------------------------------------------- | ----- | -------------------------------------------------- |
| `public/sprites/crops/carrot-0.png` … `-4.png` | 32×32 | Carrot stages (root, orange).                      |
| `public/sprites/crops/wheat-0.png` … `-4.png`  | 32×32 | Wheat stages (stalk, golden tassel).               |
| `public/sprites/crops/strawberry-*.png`        | 32×32 | Strawberry stages (low bush, red fruit).           |
| `public/sprites/crops/tomato-*.png`            | 32×32 | Tomato stages (low bush, red fruit on vine).       |
| `public/sprites/crops/pumpkin-*.png`           | 32×32 | Pumpkin stages (low vine, large round orange).     |
| `public/sprites/crops/sunflower-*.png`         | 32×32 | Sunflower stages (tall stalk, yellow head).        |
| `public/sprites/crops/grape-*.png`             | 32×32 | Grape stages (low vine, purple cluster).           |
| `public/sprites/crops/pineapple-*.png`         | 32×32 | Pineapple stages (small palm, spiky yellow fruit). |

If you want **idle animation frames**, ship a horizontal strip:
`<id>-<stage>-idle.png` at `4 frames × 32 px = 128×32 px`, and we'll add an
animation in `lib/game/scenes/garden-scene.ts`.

## Tiles

Drop into `public/tiles/`.

| Filename                      | Size  | Description                                              |
| ----------------------------- | ----- | -------------------------------------------------------- |
| `public/tiles/field.png`      | 32×32 | Seamless grass field tile (replaces `tile-field`).       |
| `public/tiles/soil.png`       | 32×32 | Plot with planted soil (replaces `tile-soil`).           |
| `public/tiles/empty-plot.png` | 32×32 | Empty plot with planter frame (replaces `tile-empty-plot`). |

## Audio

Drop into `public/audio/`.

| Filename                       | Length | Description                                                                 |
| ------------------------------ | ------ | --------------------------------------------------------------------------- |
| `public/audio/start.mp3`       | <1s    | Soft chime when a session starts.                                           |
| `public/audio/complete.mp3`    | 1–2s   | Warm three-note jingle when a session completes.                            |
| `public/audio/plant.mp3`       | <1s    | Soft "shhk" when seeds are planted.                                         |
| `public/audio/harvest.mp3`     | <1s    | Crisp pluck when a crop is harvested.                                       |
| `public/audio/click.mp3`       | <0.2s  | Tiny UI click for buttons (subtle).                                         |
| `public/audio/ambient-day.mp3` | 30–90s | Looping cozy ambient: light wind, soft chimes, optional birds. Volume-safe. |

## Backgrounds (optional, post-MVP)

For richer parallax later:

| Filename                           | Size    | Description                |
| ---------------------------------- | ------- | -------------------------- |
| `public/sprites/bg/sky-day.png`    | 560×120 | Sky band, soft pastel.     |
| `public/sprites/bg/hills-far.png`  | 560×80  | Far hills (parallax 0.3).  |
| `public/sprites/bg/hills-near.png` | 560×100 | Near hills (parallax 0.6). |

## Open-source-friendly art packs (suggested seeds)

If you want **CC0** placeholders that are nicer than the procedural ones:

- [Kenney — Cute Farm Crops](https://kenney.nl/assets/cute-farm-crops)
- [Kenney — Tiny Town](https://kenney.nl/assets/tiny-town)
- [Pixel Frog — Pixel Adventure 1](https://pixelfrog-assets.itch.io/pixel-adventure-1)
- [Kenney — UI Audio](https://kenney.nl/assets/ui-audio)

These are all CC0 (public domain). When swapping in, rename the files to match
the tables above.
