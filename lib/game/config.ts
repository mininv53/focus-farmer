import * as Phaser from 'phaser';
import { RealmScene } from './scenes/realm-scene';

export function makePhaserConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#f6efe1',
    pixelArt: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 560,
      height: 320,
    },
    physics: { default: 'arcade' },
    scene: [RealmScene],
  };
}
