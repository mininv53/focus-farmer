import type * as Phaser from 'phaser';
import { SpiritSpecies } from '@/lib/spirits/catalog';

/**
 * Procedural pixel-art texture generator. Creates 32x32 sprites for spirits,
 * tiles for plots, and a parallax background. All textures are baked into the
 * Phaser texture cache under stable keys so scenes can reference them.
 *
 * Replacing with hand-drawn assets later: drop a PNG of the same name into
 * /public/sprites/ or /public/tiles/, register it in PreloadScene before this
 * runs, and the override will win.
 */

export const TILE_SIZE = 32;

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

function colorHex(h: number, s: number, l: number): number {
  const [r, g, b] = hslToRgb(h, s, l);
  return ((Math.round(r) & 0xff) << 16) | ((Math.round(g) & 0xff) << 8) | (Math.round(b) & 0xff);
}

interface BuildContext {
  scene: Phaser.Scene;
  size: number;
}

function withGraphics(
  scene: Phaser.Scene,
  size: number,
  draw: (g: Phaser.GameObjects.Graphics) => void,
  key: string,
) {
  if (scene.textures.exists(key)) return;
  const g = scene.add.graphics({ x: 0, y: 0 });
  g.setVisible(false);
  draw(g);
  g.generateTexture(key, size, size);
  g.destroy();
}

function pixel(g: Phaser.GameObjects.Graphics, x: number, y: number, color: number, alpha = 1) {
  g.fillStyle(color, alpha);
  g.fillRect(x, y, 1, 1);
}

function fillRect(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number,
  alpha = 1,
) {
  g.fillStyle(color, alpha);
  g.fillRect(x, y, w, h);
}

/** Build the meadow tile texture. */
export function buildMeadowTile(scene: Phaser.Scene) {
  withGraphics(
    scene,
    TILE_SIZE,
    (g) => {
      const base = colorHex(95, 0.35, 0.55);
      const dark = colorHex(95, 0.4, 0.42);
      const accent = colorHex(50, 0.6, 0.6);
      fillRect(g, 0, 0, TILE_SIZE, TILE_SIZE, base);
      // sprinkle of darker tufts
      for (let i = 0; i < 22; i++) {
        const x = (i * 7 + 3) % TILE_SIZE;
        const y = (i * 11 + 5) % TILE_SIZE;
        pixel(g, x, y, dark);
        pixel(g, (x + 1) % TILE_SIZE, y, dark);
      }
      // tiny flowers
      for (let i = 0; i < 4; i++) {
        const x = (i * 9 + 4) % (TILE_SIZE - 2);
        const y = (i * 13 + 7) % (TILE_SIZE - 2);
        pixel(g, x, y, accent);
        pixel(g, x + 1, y, accent);
      }
    },
    'tile-meadow',
  );
}

/** Build the plot/seedbed tile texture (where spirits stand). */
export function buildPlotTile(scene: Phaser.Scene) {
  withGraphics(
    scene,
    TILE_SIZE,
    (g) => {
      const ring = colorHex(38, 0.25, 0.4);
      const inner = colorHex(38, 0.45, 0.62);
      // soft dirt circle
      fillRect(g, 4, 4, TILE_SIZE - 8, TILE_SIZE - 8, ring);
      fillRect(g, 6, 6, TILE_SIZE - 12, TILE_SIZE - 12, inner);
      // pebbles
      pixel(g, 8, 9, ring);
      pixel(g, 22, 11, ring);
      pixel(g, 14, 22, ring);
    },
    'tile-plot',
  );
}

/** Build empty plot (placeholder dotted outline). */
export function buildEmptyPlotTile(scene: Phaser.Scene) {
  withGraphics(
    scene,
    TILE_SIZE,
    (g) => {
      const dot = colorHex(40, 0.2, 0.55);
      // 8 dots forming a circle
      const dots = [
        [16, 4],
        [27, 9],
        [28, 20],
        [21, 27],
        [11, 27],
        [4, 20],
        [4, 11],
        [11, 4],
      ];
      for (const [x, y] of dots) pixel(g, x, y, dot);
    },
    'tile-empty',
  );
}

/** Build a single spirit sprite based on its species. */
export function buildSpiritTexture(scene: Phaser.Scene, species: SpiritSpecies) {
  const key = `spirit-${species.id}`;
  withGraphics(scene, TILE_SIZE, (g) => drawSpirit(g, species, key), key);
}

function drawSpirit(g: Phaser.GameObjects.Graphics, species: SpiritSpecies, _key: string) {
  const body = colorHex(species.hue, 0.55, 0.55);
  const dark = colorHex(species.hue, 0.55, 0.35);
  const light = colorHex(species.hue, 0.4, 0.78);
  const eyeWhite = 0xfdfcf5;
  const eyeBlack = 0x1a1530;

  if (species.shape === 'creature') {
    // 16x16 body centered in 32x32
    fillRect(g, 9, 12, 14, 12, body);
    fillRect(g, 10, 11, 12, 1, body);
    fillRect(g, 11, 24, 10, 1, dark);
    // belly
    fillRect(g, 12, 16, 8, 6, light);
    // eyes
    fillRect(g, 12, 14, 2, 2, eyeWhite);
    fillRect(g, 18, 14, 2, 2, eyeWhite);
    pixel(g, 13, 15, eyeBlack);
    pixel(g, 19, 15, eyeBlack);
    // little feet
    fillRect(g, 10, 25, 2, 1, dark);
    fillRect(g, 20, 25, 2, 1, dark);
  } else if (species.shape === 'fairy') {
    // body
    fillRect(g, 13, 14, 6, 8, body);
    fillRect(g, 12, 15, 1, 6, body);
    fillRect(g, 19, 15, 1, 6, body);
    // head
    fillRect(g, 13, 11, 6, 3, light);
    pixel(g, 14, 12, eyeBlack);
    pixel(g, 17, 12, eyeBlack);
    // wings
    fillRect(g, 6, 12, 6, 4, light, 0.85);
    fillRect(g, 20, 12, 6, 4, light, 0.85);
    fillRect(g, 7, 16, 4, 3, light, 0.7);
    fillRect(g, 21, 16, 4, 3, light, 0.7);
    // sparkle
    pixel(g, 16, 9, 0xffffff);
  } else {
    // crystal: diamond
    for (let i = 0; i < 10; i++) {
      const w = 10 - Math.abs(i - 5) * 2;
      fillRect(g, 16 - w / 2, 10 + i, w, 1, body);
    }
    for (let i = 0; i < 4; i++) {
      fillRect(g, 14, 12 + i, 2, 1, light);
    }
    pixel(g, 16, 8, 0xffffff);
    pixel(g, 16, 22, dark);
  }
}

/** Build a soft particle sprite used for resource gain bursts. */
export function buildSparkle(scene: Phaser.Scene) {
  withGraphics(
    scene,
    8,
    (g) => {
      g.fillStyle(0xfffce8, 1);
      g.fillRect(3, 0, 2, 8);
      g.fillRect(0, 3, 8, 2);
      g.fillStyle(0xfffce8, 0.6);
      g.fillRect(2, 2, 4, 4);
    },
    'sparkle',
  );
}

export function buildAll(scene: Phaser.Scene, species: SpiritSpecies[]) {
  buildMeadowTile(scene);
  buildPlotTile(scene);
  buildEmptyPlotTile(scene);
  buildSparkle(scene);
  for (const s of species) buildSpiritTexture(scene, s);
}

export const __test__ = { hslToRgb, colorHex };
