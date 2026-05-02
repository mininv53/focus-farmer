import type * as Phaser from 'phaser';
import { CROPS, STAGE_COUNT, type CropShape } from '@/lib/garden/catalog';
import type { CropSpecies } from '@/lib/garden/catalog';
import type { CropTier } from '@/lib/persistence/schema';

/**
 * Procedural farm pixel art. We generate a tiled soil background, an empty
 * planter outline, and a per-(species,stage) crop sprite. Tier glows are
 * drawn dynamically by the scene as overlays so we don't need to bake one
 * texture per tier.
 *
 * Replacing with hand-drawn assets later: drop a PNG of the same name into
 * /public/sprites/ or /public/tiles/ and load it in preload() before this runs.
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

/** Light grass background for the field around plots. */
export function buildFieldTile(scene: Phaser.Scene) {
  withGraphics(
    scene,
    TILE_SIZE,
    (g) => {
      const base = colorHex(85, 0.32, 0.62);
      const shade = colorHex(85, 0.36, 0.5);
      const tuft = colorHex(95, 0.5, 0.42);
      fillRect(g, 0, 0, TILE_SIZE, TILE_SIZE, base);
      // hatching
      for (let i = 0; i < 16; i++) {
        const x = (i * 5 + 2) % TILE_SIZE;
        const y = (i * 7 + 4) % TILE_SIZE;
        pixel(g, x, y, shade, 0.7);
      }
      // tufts
      for (let i = 0; i < 4; i++) {
        const x = (i * 9 + 3) % (TILE_SIZE - 3);
        const y = (i * 13 + 5) % (TILE_SIZE - 3);
        pixel(g, x, y, tuft);
        pixel(g, x + 1, y, tuft);
        pixel(g, x, y + 1, tuft);
      }
    },
    'tile-field',
  );
}

/** Soil plot — wooden frame with dark earth inside. */
export function buildSoilTile(scene: Phaser.Scene) {
  withGraphics(
    scene,
    TILE_SIZE,
    (g) => {
      const wood = colorHex(28, 0.35, 0.32);
      const woodLight = colorHex(28, 0.35, 0.45);
      const soil = colorHex(22, 0.42, 0.27);
      const soilLight = colorHex(22, 0.4, 0.35);
      // wooden frame
      fillRect(g, 0, 0, TILE_SIZE, 3, wood);
      fillRect(g, 0, TILE_SIZE - 3, TILE_SIZE, 3, wood);
      fillRect(g, 0, 0, 3, TILE_SIZE, wood);
      fillRect(g, TILE_SIZE - 3, 0, 3, TILE_SIZE, wood);
      // wood grain
      fillRect(g, 0, 1, TILE_SIZE, 1, woodLight, 0.6);
      fillRect(g, 1, 0, 1, TILE_SIZE, woodLight, 0.5);
      // soil
      fillRect(g, 3, 3, TILE_SIZE - 6, TILE_SIZE - 6, soil);
      // soil flecks
      for (let i = 0; i < 14; i++) {
        const x = 4 + ((i * 5) % (TILE_SIZE - 8));
        const y = 4 + ((i * 7) % (TILE_SIZE - 8));
        pixel(g, x, y, soilLight);
      }
    },
    'tile-soil',
  );
}

/** Empty planter — same wooden frame, marker dots in the middle. */
export function buildEmptyPlotTile(scene: Phaser.Scene) {
  withGraphics(
    scene,
    TILE_SIZE,
    (g) => {
      const wood = colorHex(28, 0.25, 0.4);
      const soil = colorHex(28, 0.25, 0.55);
      const dot = colorHex(28, 0.25, 0.32);
      fillRect(g, 0, 0, TILE_SIZE, 3, wood);
      fillRect(g, 0, TILE_SIZE - 3, TILE_SIZE, 3, wood);
      fillRect(g, 0, 0, 3, TILE_SIZE, wood);
      fillRect(g, TILE_SIZE - 3, 0, 3, TILE_SIZE, wood);
      fillRect(g, 3, 3, TILE_SIZE - 6, TILE_SIZE - 6, soil);
      // little plus marker indicating "tap to focus"
      fillRect(g, 15, 11, 2, 10, dot);
      fillRect(g, 11, 15, 10, 2, dot);
    },
    'tile-empty-plot',
  );
}

/** Sparkle effect for harvest bursts. */
export function buildHarvestSparkle(scene: Phaser.Scene) {
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

/** Build all crop stage textures: `crop-<id>-<stage>`, stage 0..STAGE_COUNT. */
export function buildAllCropTextures(scene: Phaser.Scene) {
  for (const c of CROPS) {
    for (let stage = 0; stage <= STAGE_COUNT; stage++) {
      buildCropStage(scene, c, stage);
    }
  }
}

function buildCropStage(scene: Phaser.Scene, species: CropSpecies, stage: number) {
  const key = `crop-${species.id}-${stage}`;
  withGraphics(scene, TILE_SIZE, (g) => drawCrop(g, species, stage), key);
}

/**
 * Draw a crop based on species shape and growth stage.
 * stage 0 = bare seed, 1 = sprout, 2 = leafing, 3 = budding, STAGE_COUNT = mature.
 */
function drawCrop(g: Phaser.GameObjects.Graphics, species: CropSpecies, stage: number) {
  const stem = colorHex(115, 0.5, 0.32);
  const stemLight = colorHex(115, 0.45, 0.5);
  const leaf = colorHex(115, 0.55, 0.45);
  const leafLight = colorHex(115, 0.55, 0.62);
  const fruit = colorHex(species.hue, 0.65, 0.5);
  const fruitLight = colorHex(species.hue, 0.65, 0.7);
  const fruitDark = colorHex(species.hue, 0.65, 0.32);
  const seed = colorHex(28, 0.55, 0.32);
  const dirt = colorHex(22, 0.4, 0.35);

  // Always draw a small dirt mound at the base.
  fillRect(g, 13, 24, 6, 2, dirt);

  if (stage === 0) {
    // Just-planted seed: tiny dot in the dirt.
    fillRect(g, 15, 22, 2, 2, seed);
    return;
  }

  // Stage 1+ uses species shape.
  switch (species.shape as CropShape) {
    case 'root':
      drawRoot(g, stage, { stem, leaf, leafLight, fruit, fruitLight, fruitDark });
      break;
    case 'stalk':
      drawStalk(g, stage, { stem, stemLight, leaf, leafLight, fruit, fruitLight, fruitDark });
      break;
    case 'bush':
      drawBush(g, stage, { stem, leaf, leafLight, fruit, fruitLight, fruitDark });
      break;
    case 'vine':
      drawVine(g, stage, { stem, leaf, leafLight, fruit, fruitLight, fruitDark });
      break;
    case 'tree':
      drawTree(g, stage, { stem, leaf, leafLight, fruit, fruitLight, fruitDark });
      break;
  }
}

interface PaletteRoot {
  stem: number;
  leaf: number;
  leafLight: number;
  fruit: number;
  fruitLight: number;
  fruitDark: number;
}
interface PaletteStalk extends PaletteRoot {
  stemLight: number;
}

function drawRoot(g: Phaser.GameObjects.Graphics, stage: number, p: PaletteRoot) {
  // Carrot-style: leafy top, root tucked under at maturity.
  // stage 1: tiny green sprout. stage 2: leaves visible. stage 3: shoulder of fruit. stage 4: full fruit poking up.
  if (stage >= 1) {
    fillRect(g, 15, 18, 2, 6, p.stem);
    fillRect(g, 13, 17, 2, 2, p.leaf);
    fillRect(g, 17, 17, 2, 2, p.leaf);
  }
  if (stage >= 2) {
    fillRect(g, 11, 14, 4, 3, p.leaf);
    fillRect(g, 17, 14, 4, 3, p.leaf);
    fillRect(g, 14, 12, 4, 4, p.leafLight);
  }
  if (stage >= 3) {
    // shoulders of root showing
    fillRect(g, 13, 22, 6, 2, p.fruit);
    fillRect(g, 14, 24, 4, 1, p.fruitDark);
  }
  if (stage >= 4) {
    // full root visible
    fillRect(g, 12, 19, 8, 6, p.fruit);
    fillRect(g, 13, 25, 6, 1, p.fruitDark);
    fillRect(g, 13, 19, 1, 5, p.fruitLight);
    fillRect(g, 11, 14, 4, 3, p.leaf);
    fillRect(g, 17, 14, 4, 3, p.leaf);
    fillRect(g, 14, 11, 4, 4, p.leafLight);
  }
}

function drawStalk(g: Phaser.GameObjects.Graphics, stage: number, p: PaletteStalk) {
  // Wheat / sunflower style: tall stem, head at top.
  if (stage >= 1) {
    fillRect(g, 15, 20, 2, 5, p.stem);
  }
  if (stage >= 2) {
    fillRect(g, 15, 16, 2, 9, p.stem);
    fillRect(g, 13, 18, 2, 2, p.leaf);
    fillRect(g, 17, 18, 2, 2, p.leaf);
  }
  if (stage >= 3) {
    fillRect(g, 15, 12, 2, 13, p.stem);
    fillRect(g, 11, 14, 4, 3, p.leaf);
    fillRect(g, 17, 14, 4, 3, p.leaf);
    fillRect(g, 14, 9, 4, 4, p.fruit);
    fillRect(g, 14, 9, 1, 4, p.stemLight, 0.6);
  }
  if (stage >= 4) {
    fillRect(g, 15, 12, 2, 13, p.stem);
    fillRect(g, 12, 5, 8, 8, p.fruit);
    fillRect(g, 13, 4, 6, 1, p.fruitLight);
    fillRect(g, 13, 13, 6, 1, p.fruitDark);
    fillRect(g, 14, 8, 4, 1, p.fruitLight, 0.7);
    fillRect(g, 11, 14, 4, 3, p.leaf);
    fillRect(g, 17, 14, 4, 3, p.leaf);
  }
}

function drawBush(g: Phaser.GameObjects.Graphics, stage: number, p: PaletteRoot) {
  // Strawberry / tomato: rounded leafy bush with fruits.
  if (stage >= 1) {
    fillRect(g, 14, 21, 4, 3, p.leaf);
  }
  if (stage >= 2) {
    fillRect(g, 11, 17, 10, 7, p.leaf);
    fillRect(g, 13, 16, 6, 1, p.leafLight);
    fillRect(g, 12, 18, 1, 4, p.leafLight, 0.6);
  }
  if (stage >= 3) {
    fillRect(g, 10, 14, 12, 10, p.leaf);
    fillRect(g, 12, 13, 8, 1, p.leafLight);
    fillRect(g, 11, 15, 1, 6, p.leafLight, 0.7);
    // small fruit
    fillRect(g, 14, 19, 2, 2, p.fruit);
    fillRect(g, 17, 21, 2, 2, p.fruit);
  }
  if (stage >= 4) {
    fillRect(g, 9, 12, 14, 12, p.leaf);
    fillRect(g, 11, 11, 10, 1, p.leafLight);
    fillRect(g, 10, 13, 1, 8, p.leafLight, 0.6);
    // 3 ripe fruits
    fillRect(g, 12, 18, 3, 3, p.fruit);
    fillRect(g, 16, 16, 3, 3, p.fruit);
    fillRect(g, 14, 21, 3, 3, p.fruit);
    pixel(g, 12, 18, p.fruitLight);
    pixel(g, 16, 16, p.fruitLight);
    pixel(g, 14, 21, p.fruitLight);
  }
}

function drawVine(g: Phaser.GameObjects.Graphics, stage: number, p: PaletteRoot) {
  // Pumpkin / grape: low spreading vine with hanging fruits.
  if (stage >= 1) {
    fillRect(g, 14, 22, 4, 2, p.leaf);
  }
  if (stage >= 2) {
    fillRect(g, 9, 21, 14, 3, p.leaf);
    fillRect(g, 11, 20, 10, 1, p.leafLight);
  }
  if (stage >= 3) {
    fillRect(g, 8, 19, 16, 5, p.leaf);
    fillRect(g, 10, 18, 12, 1, p.leafLight);
    // tendril
    fillRect(g, 16, 14, 1, 4, p.stem);
    pixel(g, 17, 13, p.stem);
  }
  if (stage >= 4) {
    fillRect(g, 7, 17, 18, 7, p.leaf);
    fillRect(g, 9, 16, 14, 1, p.leafLight);
    // big round fruit
    fillRect(g, 11, 9, 10, 8, p.fruit);
    fillRect(g, 12, 8, 8, 1, p.fruit);
    fillRect(g, 12, 17, 8, 1, p.fruit);
    fillRect(g, 13, 9, 1, 7, p.fruitLight, 0.6);
    fillRect(g, 19, 9, 1, 7, p.fruitDark, 0.6);
    fillRect(g, 15, 7, 2, 2, p.stem);
  }
}

function drawTree(g: Phaser.GameObjects.Graphics, stage: number, p: PaletteRoot) {
  // Pineapple / fruit tree: trunk + crown.
  if (stage >= 1) {
    fillRect(g, 15, 20, 2, 4, p.stem);
  }
  if (stage >= 2) {
    fillRect(g, 15, 16, 2, 8, p.stem);
    fillRect(g, 13, 16, 2, 2, p.leaf);
    fillRect(g, 17, 16, 2, 2, p.leaf);
  }
  if (stage >= 3) {
    fillRect(g, 15, 13, 2, 11, p.stem);
    fillRect(g, 11, 13, 4, 3, p.leaf);
    fillRect(g, 17, 13, 4, 3, p.leaf);
    fillRect(g, 13, 10, 6, 4, p.leafLight);
  }
  if (stage >= 4) {
    fillRect(g, 15, 14, 2, 10, p.stem);
    // fruit body
    fillRect(g, 11, 12, 10, 8, p.fruit);
    fillRect(g, 12, 11, 8, 1, p.fruit);
    fillRect(g, 12, 20, 8, 1, p.fruit);
    fillRect(g, 12, 13, 1, 6, p.fruitLight, 0.7);
    fillRect(g, 19, 13, 1, 6, p.fruitDark, 0.6);
    // crown leaves
    fillRect(g, 13, 7, 2, 5, p.leaf);
    fillRect(g, 17, 7, 2, 5, p.leaf);
    fillRect(g, 15, 6, 2, 6, p.leafLight);
  }
}

export function buildAllFarmTextures(scene: Phaser.Scene) {
  buildFieldTile(scene);
  buildSoilTile(scene);
  buildEmptyPlotTile(scene);
  buildHarvestSparkle(scene);
  buildAllCropTextures(scene);
}

/** Tier glow colours for drawing dynamic halos around mature crops. */
export const TIER_GLOW: Record<CropTier, { color: number; alpha: number }> = {
  common: { color: 0xc2de9b, alpha: 0 },
  rare: { color: 0xc0b9dd, alpha: 0.4 },
  epic: { color: 0x75d1b7, alpha: 0.5 },
  legendary: { color: 0xd18a75, alpha: 0.6 },
  mythic: { color: 0xa33e7e, alpha: 0.7 },
};

export const __test__ = { hslToRgb, colorHex };
