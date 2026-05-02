import * as Phaser from 'phaser';
import { SpiritInstance } from '@/lib/persistence/schema';
import { SPIRIT_BY_ID, REALM_CAPACITY } from '@/lib/spirits/catalog';
import { TILE_SIZE, buildAll } from '@/lib/game/textures/procedural';

const COLS = 4;
const ROWS = Math.ceil(REALM_CAPACITY / COLS);

const CELL_W = 96;
const CELL_H = 96;
const ORIGIN_X = 80;
const ORIGIN_Y = 96;

interface SpiritView {
  spirit: SpiritInstance;
  sprite: Phaser.GameObjects.Sprite;
  rarityHalo?: Phaser.GameObjects.Graphics;
  tween?: Phaser.Tweens.Tween;
}

export class RealmScene extends Phaser.Scene {
  private spiritViews = new Map<string, SpiritView>();
  private plotTiles: Phaser.GameObjects.Image[] = [];
  private bgTiles: Phaser.GameObjects.Image[] = [];
  private title?: Phaser.GameObjects.Text;
  private hint?: Phaser.GameObjects.Text;

  constructor() {
    super('RealmScene');
  }

  preload() {
    // Procedural textures are built in create() against the scene.
  }

  create() {
    buildAll(this, Object.values(SPIRIT_BY_ID));

    // Tiled meadow background.
    const w = this.scale.width;
    const h = this.scale.height;
    for (let y = 0; y < h; y += TILE_SIZE) {
      for (let x = 0; x < w; x += TILE_SIZE) {
        const t = this.add.image(x, y, 'tile-meadow').setOrigin(0, 0).setScale(2).setAlpha(0.95);
        this.bgTiles.push(t);
      }
    }

    // Plot grid.
    for (let i = 0; i < REALM_CAPACITY; i++) {
      const { cx, cy } = this.plotCenter(i);
      const t = this.add.image(cx, cy, 'tile-empty').setScale(2);
      this.plotTiles.push(t);
    }

    this.title = this.add
      .text(this.scale.width / 2, 32, 'your realm', {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#2a2438',
      })
      .setOrigin(0.5);

    this.hint = this.add
      .text(
        this.scale.width / 2,
        this.scale.height - 24,
        'finish a focus session to summon a spirit',
        {
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#5b3a85',
        },
      )
      .setOrigin(0.5);

    this.game.events.emit('realm-ready');
  }

  private plotCenter(i: number) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const cx = ORIGIN_X + col * CELL_W + CELL_W / 2;
    const cy = ORIGIN_Y + row * CELL_H + CELL_H / 2;
    return { cx, cy };
  }

  /** Sync all spirits visuals to match the given list. Diff and only animate changes. */
  syncSpirits(spirits: SpiritInstance[]) {
    if (!this.scene.isActive()) return;

    const incoming = new Map(spirits.map((s) => [s.id, s]));
    // Remove views for spirits that are gone.
    for (const [id, view] of this.spiritViews) {
      if (!incoming.has(id)) {
        view.tween?.stop();
        view.sprite.destroy();
        view.rarityHalo?.destroy();
        this.spiritViews.delete(id);
      }
    }

    // Mark plots as filled or empty.
    for (let i = 0; i < this.plotTiles.length; i++) {
      const tile = this.plotTiles[i];
      const occupied = spirits.some((s) => s.plotIndex === i);
      tile.setTexture(occupied ? 'tile-plot' : 'tile-empty');
    }

    // Add or move spirit views.
    for (const s of spirits) {
      const existing = this.spiritViews.get(s.id);
      const { cx, cy } = this.plotCenter(s.plotIndex);
      const species = SPIRIT_BY_ID[s.speciesId];
      if (!species) continue;
      const textureKey = `spirit-${species.id}`;

      if (existing) {
        existing.sprite.setPosition(cx, cy - 8);
        continue;
      }

      const halo = this.makeHalo(s.rarity, cx, cy);
      const sprite = this.add
        .sprite(cx, cy - 8, textureKey)
        .setScale(2)
        .setAlpha(0);

      const tween = this.tweens.add({
        targets: sprite,
        y: cy - 14,
        duration: 1100 + (s.plotIndex % 3) * 130,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.tweens.add({
        targets: sprite,
        alpha: 1,
        duration: 320,
        ease: 'Quad.easeOut',
      });

      this.spiritViews.set(s.id, { spirit: s, sprite, rarityHalo: halo, tween });
    }
  }

  private makeHalo(rarity: SpiritInstance['rarity'], cx: number, cy: number) {
    const halo = this.add.graphics({ x: cx, y: cy });
    let color = 0xa8c5d4;
    let alpha = 0.0;
    if (rarity === 'rare') {
      color = 0xa78bfa;
      alpha = 0.35;
    } else if (rarity === 'legendary') {
      color = 0xfbbf24;
      alpha = 0.55;
    }
    if (alpha > 0) {
      halo.fillStyle(color, alpha);
      halo.fillCircle(0, 4, 24);
      this.tweens.add({
        targets: halo,
        alpha: alpha * 0.4,
        duration: 1600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    } else {
      halo.setVisible(false);
    }
    return halo;
  }

  /** Burst effect played when a spirit is freshly summoned. */
  playSummonBurst(plotIndex: number) {
    if (!this.scene.isActive()) return;
    const { cx, cy } = this.plotCenter(plotIndex);
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const sparkle = this.add.image(cx, cy, 'sparkle').setScale(0.8 + Math.random() * 0.6);
      this.tweens.add({
        targets: sparkle,
        x: cx + Math.cos(angle) * 36,
        y: cy + Math.sin(angle) * 36,
        alpha: 0,
        scale: 0.2,
        duration: 700,
        onComplete: () => sparkle.destroy(),
      });
    }
  }

  /** Soft pulse on plots when an idle harvest is collected. */
  playIdleCollectPulse() {
    if (!this.scene.isActive()) return;
    for (const [, view] of this.spiritViews) {
      this.tweens.add({
        targets: view.sprite,
        scale: 2.2,
        duration: 220,
        yoyo: true,
        ease: 'Sine.easeInOut',
      });
    }
  }
}
