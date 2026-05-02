import * as Phaser from 'phaser';
import type { PlantedCrop } from '@/lib/persistence/schema';
import { GARDEN_CAPACITY, GARDEN_COLS, STAGE_COUNT } from '@/lib/garden/catalog';
import { growthFor } from '@/lib/garden/growth';
import { TIER_GLOW, TILE_SIZE, buildAllFarmTextures } from '@/lib/game/textures/farm';

const ROWS = Math.ceil(GARDEN_CAPACITY / GARDEN_COLS);
const CELL_W = 88;
const CELL_H = 88;
const ORIGIN_X = 56;
const ORIGIN_Y = 80;

interface CropView {
  crop: PlantedCrop;
  sprite: Phaser.GameObjects.Sprite;
  glow?: Phaser.GameObjects.Graphics;
  bounce?: Phaser.Tweens.Tween;
  matureTween?: Phaser.Tweens.Tween;
}

/**
 * Phaser scene for the planting garden. Stateless w.r.t. React: the canvas
 * pushes diffs into syncCrops() which positions sprites and updates stages
 * based on wall-clock growth.
 */
export class GardenScene extends Phaser.Scene {
  private cropViews = new Map<string, CropView>();
  private plotTiles: Phaser.GameObjects.Image[] = [];
  private bgTiles: Phaser.GameObjects.Image[] = [];
  private cropsRef: PlantedCrop[] = [];
  private clickHandler: ((plotIndex: number) => void) | null = null;
  private harvestHandler: ((cropId: string) => void) | null = null;

  constructor() {
    super('GardenScene');
  }

  create() {
    buildAllFarmTextures(this);

    const w = this.scale.width;
    const h = this.scale.height;
    for (let y = 0; y < h; y += TILE_SIZE * 2) {
      for (let x = 0; x < w; x += TILE_SIZE * 2) {
        const t = this.add.image(x, y, 'tile-field').setOrigin(0, 0).setScale(2);
        this.bgTiles.push(t);
      }
    }

    for (let i = 0; i < GARDEN_CAPACITY; i++) {
      const { cx, cy } = this.plotCenter(i);
      const tile = this.add
        .image(cx, cy, 'tile-empty-plot')
        .setScale(2)
        .setInteractive({ useHandCursor: true });
      tile.on('pointerdown', () => {
        if (this.clickHandler) this.clickHandler(i);
      });
      this.plotTiles.push(tile);
    }

    this.add
      .text(this.scale.width / 2, 24, 'YOUR GARDEN', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#4b3b40',
      })
      .setOrigin(0.5);

    this.add
      .text(
        this.scale.width / 2,
        this.scale.height - 18,
        'finish a focus session to plant seeds · tap a ripe crop to harvest',
        {
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#82735c',
        },
      )
      .setOrigin(0.5);

    // Periodic redraw so growth stages tick visually without React poking us
    // every frame.
    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => this.refreshGrowth(),
    });

    this.game.events.emit('garden-ready');
  }

  setHandlers(opts: {
    onPlotClick?: (plotIndex: number) => void;
    onHarvest?: (cropId: string) => void;
  }) {
    this.clickHandler = opts.onPlotClick ?? null;
    this.harvestHandler = opts.onHarvest ?? null;
  }

  private plotCenter(i: number) {
    const col = i % GARDEN_COLS;
    const row = Math.floor(i / GARDEN_COLS);
    const cx = ORIGIN_X + col * CELL_W + CELL_W / 2;
    const cy = ORIGIN_Y + row * CELL_H + CELL_H / 2;
    return { cx, cy };
  }

  syncCrops(crops: PlantedCrop[]) {
    if (!this.scene.isActive()) return;
    this.cropsRef = crops;
    const incoming = new Map(crops.map((c) => [c.id, c]));

    for (const [id, view] of this.cropViews) {
      if (!incoming.has(id)) {
        view.bounce?.stop();
        view.matureTween?.stop();
        view.sprite.destroy();
        view.glow?.destroy();
        this.cropViews.delete(id);
      }
    }

    for (let i = 0; i < this.plotTiles.length; i++) {
      const occupied = crops.some((c) => c.plotIndex === i);
      this.plotTiles[i].setTexture(occupied ? 'tile-soil' : 'tile-empty-plot');
    }

    for (const c of crops) {
      const { cx, cy } = this.plotCenter(c.plotIndex);
      const existing = this.cropViews.get(c.id);
      const stage = growthFor(c, Date.now()).mature ? STAGE_COUNT : growthFor(c, Date.now()).stage;
      const textureKey = `crop-${c.speciesId}-${stage}`;

      if (existing) {
        existing.sprite.setTexture(textureKey);
        existing.sprite.setPosition(cx, cy - 6);
        continue;
      }

      const sprite = this.add
        .sprite(cx, cy - 6, textureKey)
        .setScale(2)
        .setAlpha(0)
        .setInteractive({ useHandCursor: true });
      sprite.on('pointerdown', () => {
        if (this.harvestHandler) this.harvestHandler(c.id);
      });

      this.tweens.add({
        targets: sprite,
        alpha: 1,
        duration: 280,
        ease: 'Quad.easeOut',
      });

      this.cropViews.set(c.id, { crop: c, sprite });
    }

    this.refreshGrowth();
  }

  /** Recompute stage textures + glow from wall-clock for currently tracked crops. */
  private refreshGrowth() {
    const now = Date.now();
    for (const view of this.cropViews.values()) {
      const g = growthFor(view.crop, now);
      const stage = g.mature ? STAGE_COUNT : g.stage;
      const key = `crop-${view.crop.speciesId}-${stage}`;
      if (view.sprite.texture.key !== key) {
        view.sprite.setTexture(key);
      }
      if (g.mature) {
        // Pulse + glow when mature.
        if (!view.glow) {
          const tier = TIER_GLOW[view.crop.tier];
          const glow = this.add.graphics({ x: view.sprite.x, y: view.sprite.y + 4 });
          glow.fillStyle(tier.color, Math.max(0.3, tier.alpha));
          glow.fillCircle(0, 0, 22);
          glow.setDepth(view.sprite.depth - 1);
          this.tweens.add({
            targets: glow,
            alpha: 0.4,
            duration: 1100,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
          });
          view.glow = glow;
        }
        if (!view.bounce) {
          view.bounce = this.tweens.add({
            targets: view.sprite,
            y: view.sprite.y - 4,
            duration: 700,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
          });
        }
      } else if (view.glow || view.bounce) {
        view.bounce?.stop();
        view.bounce = undefined;
        view.glow?.destroy();
        view.glow = undefined;
      }
    }
  }

  /** Burst of sparkles when a crop is harvested. */
  playHarvestBurst(plotIndex: number) {
    if (!this.scene.isActive()) return;
    const { cx, cy } = this.plotCenter(plotIndex);
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const sparkle = this.add.image(cx, cy - 6, 'sparkle').setScale(2);
      this.tweens.add({
        targets: sparkle,
        x: cx + Math.cos(angle) * 36,
        y: cy + Math.sin(angle) * 36 - 6,
        alpha: 0,
        duration: 560,
        ease: 'Quad.easeOut',
        onComplete: () => sparkle.destroy(),
      });
    }
  }

  /** Soft pulse on all crops, e.g. when player returns from being away. */
  playWelcomePulse() {
    if (!this.scene.isActive()) return;
    for (const view of this.cropViews.values()) {
      this.tweens.add({
        targets: view.sprite,
        scale: 2.2,
        duration: 220,
        yoyo: true,
        ease: 'Quad.easeOut',
      });
    }
  }

  /** Read a snapshot of current crop refs (used by canvas wrapper). */
  get currentCrops(): PlantedCrop[] {
    return this.cropsRef;
  }
}
