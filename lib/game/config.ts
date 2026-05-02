import * as Phaser from 'phaser';
import { GardenScene } from '@/lib/game/scenes/garden-scene';

export function makePhaserConfig(parent: HTMLDivElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: 440,
    height: 360,
    backgroundColor: '#f7f4ea',
    pixelArt: true,
    antialias: false,
    scene: [GardenScene],
    scale: {
      mode: Phaser.Scale.NONE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };
}
